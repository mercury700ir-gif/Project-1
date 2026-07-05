const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'کاربری با این ایمیل یافت نشد' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'رمز عبور اشتباه است' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'نام، ایمیل و رمز عبور الزامی است' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, passwordHash, 'subscriber', 'active']
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: 'subscriber', name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, role: 'subscriber' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'ایمیل و رمز جدید الزامی است' });
    }

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'کاربری با این ایمیل یافت نشد' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);

    res.json({ message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'توکن ارائه نشده' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json(rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'توکن نامعتبر' });
  }
});

module.exports = router;
