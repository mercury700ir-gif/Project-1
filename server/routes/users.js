const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - List all users
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// GET /api/users/admins - List admin users
router.get('/admins', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE role IN ('admin','editor') ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// GET /api/users/members - List regular members
router.get('/members', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, newsletter, created_at FROM users WHERE role = 'subscriber' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// POST /api/users - Create admin user
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'فیلدهای ضروری را پر کنید' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, role, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, role || 'editor', passwordHash, 'active']
    );

    res.status(201).json({ id: result.insertId, name, email, phone, role: role || 'editor' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password, newsletter, status } = req.body;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
    }

    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (role) { updates.push('role = ?'); values.push(role); }
    if (newsletter !== undefined) { updates.push('newsletter = ?'); values.push(newsletter); }
    if (status) { updates.push('status = ?'); values.push(status); }

    if (updates.length > 0) {
      values.push(id);
      await pool.query('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?', values);
    }

    res.json({ message: 'کاربر به‌روزرسانی شد' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'کاربر حذف شد' });
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

module.exports = router;
