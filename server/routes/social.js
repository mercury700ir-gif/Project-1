const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => { try { const [r] = await pool.query('SELECT * FROM social_accounts ORDER BY platform'); res.json(r); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { const { handle, is_connected, api_token, settings } = req.body; const u = []; const v = [];
    if (handle !== undefined) { u.push('handle = ?'); v.push(handle); }
    if (is_connected !== undefined) { u.push('is_connected = ?'); v.push(is_connected ? 1 : 0); }
    if (api_token !== undefined) { u.push('api_token = ?'); v.push(api_token); }
    if (settings !== undefined) { u.push('settings = ?'); v.push(JSON.stringify(settings)); }
    if (u.length) { v.push(req.params.id); await pool.query('UPDATE social_accounts SET ' + u.join(', ') + ' WHERE id = ?', v); }
    res.json({ message: 'به‌روزرسانی شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/schedules', async (req, res) => { try { const [r] = await pool.query('SELECT s.*, p.title as post_title FROM social_schedules s LEFT JOIN posts p ON s.post_id = p.id ORDER BY s.scheduled_at DESC'); res.json(r); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/schedules', authMiddleware, adminOnly, async (req, res) => {
  try { const { post_id, platform_ids, message, scheduled_at } = req.body; const [r] = await pool.query('INSERT INTO social_schedules (post_id, platform_ids, message, scheduled_at, status) VALUES (?,?,?,?,?)', [post_id, JSON.stringify(platform_ids), message || '', scheduled_at, 'scheduled']); res.status(201).json({ id: r.insertId }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/schedules/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('UPDATE social_schedules SET status = ? WHERE id = ?', [req.body.status, req.params.id]); res.json({ message: 'به‌روزرسانی شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
