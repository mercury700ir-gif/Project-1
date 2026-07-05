const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'کاربری با این ایمیل یافت نشد' });
    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'رمز عبور اشتباه است' });
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'فیلدهای ضروری را پر کنید' });
    const [ex] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده' });
    const hash = bcrypt.hashSync(password, 12);
    const [r] = await pool.query('INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?,?,?,?,?,?)', [name, email, phone || null, hash, 'subscriber', 'active']);
    const token = jwt.sign({ id: r.insertId, email, role: 'subscriber', name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: r.insertId, name, email, role: 'subscriber' } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'فیلدهای ضروری را پر کنید' });
    const [ex] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!ex.length) return res.status(404).json({ error: 'کاربر یافت نشد' });
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [bcrypt.hashSync(newPassword, 12), email]);
    res.json({ message: 'رمز عبور تغییر کرد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'توکن ارائه نشده' });
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [d.id]);
    rows.length ? res.json(rows[0]) : res.status(404).json({ error: 'یافت نشد' });
  } catch (err) { res.status(401).json({ error: 'توکن نامعتبر' }); }
});

module.exports = router;
