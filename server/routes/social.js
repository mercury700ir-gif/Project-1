const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => { try { res.json(db.prepare('SELECT * FROM social_accounts ORDER BY platform').all()); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { handle, is_connected, api_token, settings } = req.body;
    const u = []; const v = [];
    if (handle !== undefined) { u.push('handle = ?'); v.push(handle); }
    if (is_connected !== undefined) { u.push('is_connected = ?'); v.push(is_connected ? 1 : 0); }
    if (api_token !== undefined) { u.push('api_token = ?'); v.push(api_token); }
    if (settings !== undefined) { u.push('settings = ?'); v.push(JSON.stringify(settings)); }
    if (u.length > 0) { v.push(req.params.id); db.prepare('UPDATE social_accounts SET ' + u.join(', ') + ' WHERE id = ?').run(...v); }
    res.json({ message: 'به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/schedules', (req, res) => {
  try { res.json(db.prepare('SELECT s.*, p.title as post_title FROM social_schedules s LEFT JOIN posts p ON s.post_id = p.id ORDER BY s.scheduled_at DESC').all()); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/schedules', authMiddleware, adminOnly, (req, res) => {
  try {
    const { post_id, platform_ids, message, scheduled_at } = req.body;
    const r = db.prepare('INSERT INTO social_schedules (post_id, platform_ids, message, scheduled_at, status) VALUES (?,?,?,?,?)').run(post_id, JSON.stringify(platform_ids), message || '', scheduled_at, 'scheduled');
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/schedules/:id', authMiddleware, adminOnly, (req, res) => {
  try { db.prepare('UPDATE social_schedules SET status = ? WHERE id = ?').run(req.body.status, req.params.id); res.json({ message: 'به‌روزرسانی شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
