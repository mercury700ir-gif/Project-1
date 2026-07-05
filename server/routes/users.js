const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/admins', authMiddleware, adminOnly, (req, res) => {
  try {
    const rows = db.prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE role IN ('admin','editor') ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/members', authMiddleware, adminOnly, (req, res) => {
  try {
    const rows = db.prepare("SELECT id, name, email, phone, newsletter, created_at FROM users WHERE role = 'subscriber' ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'فیلدهای ضروری را پر کنید' });
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
      return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده' });
    }
    const passwordHash = bcrypt.hashSync(password, 12);
    const result = db.prepare('INSERT INTO users (name, email, phone, role, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, phone || null, role || 'editor', passwordHash, 'active');
    res.status(201).json({ id: result.lastInsertRowid, name, email, phone, role: role || 'editor' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { name, email, phone, role, password, newsletter, status } = req.body;
    if (password) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 12), req.params.id);
    }
    const updates = []; const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (role) { updates.push('role = ?'); values.push(role); }
    if (newsletter !== undefined) { updates.push('newsletter = ?'); values.push(newsletter ? 1 : 0); }
    if (status) { updates.push('status = ?'); values.push(status); }
    if (updates.length > 0) { values.push(req.params.id); db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?').run(...values); }
    res.json({ message: 'کاربر به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'کاربر حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
