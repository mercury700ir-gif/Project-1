const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try { const [r] = await pool.query('SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC'); res.json(r); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/admins', authMiddleware, adminOnly, async (req, res) => {
  try { const [r] = await pool.query("SELECT id, name, email, phone, role, created_at FROM users WHERE role IN ('admin','editor') ORDER BY created_at DESC"); res.json(r); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/members', authMiddleware, adminOnly, async (req, res) => {
  try { const [r] = await pool.query("SELECT id, name, email, phone, newsletter, created_at FROM users WHERE role = 'subscriber' ORDER BY created_at DESC"); res.json(r); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'فیلدهای ضروری را پر کنید' });
    const [ex] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) return res.status(409).json({ error: 'ایمیل تکراری' });
    const [r] = await pool.query('INSERT INTO users (name, email, phone, role, password_hash, status) VALUES (?,?,?,?,?,?)', [name, email, phone || null, role || 'editor', bcrypt.hashSync(password, 12), 'active']);
    res.status(201).json({ id: r.insertId, name, email, phone, role: role || 'editor' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role, password, newsletter, status } = req.body;
    if (password) await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [bcrypt.hashSync(password, 12), req.params.id]);
    const u = []; const v = [];
    if (name) { u.push('name = ?'); v.push(name); }
    if (email) { u.push('email = ?'); v.push(email); }
    if (phone !== undefined) { u.push('phone = ?'); v.push(phone); }
    if (role) { u.push('role = ?'); v.push(role); }
    if (newsletter !== undefined) { u.push('newsletter = ?'); v.push(newsletter ? 1 : 0); }
    if (status) { u.push('status = ?'); v.push(status); }
    if (u.length) { v.push(req.params.id); await pool.query('UPDATE users SET ' + u.join(', ') + ' WHERE id = ?', v); }
    res.json({ message: 'به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]); res.json({ message: 'حذف شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
