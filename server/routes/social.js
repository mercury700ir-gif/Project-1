const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM social_accounts ORDER BY platform');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { handle, is_connected, api_token, settings } = req.body;
    const updates = []; const values = [];
    if (handle !== undefined) { updates.push('handle = ?'); values.push(handle); }
    if (is_connected !== undefined) { updates.push('is_connected = ?'); values.push(is_connected); }
    if (api_token !== undefined) { updates.push('api_token = ?'); values.push(api_token); }
    if (settings !== undefined) { updates.push('settings = ?'); values.push(JSON.stringify(settings)); }
    if (updates.length > 0) { values.push(req.params.id); await pool.query('UPDATE social_accounts SET ' + updates.join(', ') + ' WHERE id = ?', values); }
    res.json({ message: 'حساب شبکه اجتماعی به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/schedules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, p.title as post_title FROM social_schedules s LEFT JOIN posts p ON s.post_id = p.id ORDER BY s.scheduled_at DESC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/schedules', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { post_id, platform_ids, message, scheduled_at } = req.body;
    const [result] = await pool.query(
      'INSERT INTO social_schedules (post_id, platform_ids, message, scheduled_at, status) VALUES (?,?,?,?,?)',
      [post_id, JSON.stringify(platform_ids), message || '', scheduled_at, 'scheduled']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/schedules/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE social_schedules SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'وضعیت به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
