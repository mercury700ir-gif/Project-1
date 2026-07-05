const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, image_path, link_url, position, caption, position_x, position_y } = req.body;
    const [result] = await pool.query(
      'INSERT INTO banners (title, image_path, link_url, position, caption, position_x, position_y) VALUES (?,?,?,?,?,?,?)',
      [title, image_path || null, link_url || null, position || 'custom', caption || null, position_x || 50, position_y || 50]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, image_path, link_url, position, caption, is_active, position_x, position_y } = req.body;
    const updates = []; const values = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (image_path !== undefined) { updates.push('image_path = ?'); values.push(image_path); }
    if (link_url !== undefined) { updates.push('link_url = ?'); values.push(link_url); }
    if (position !== undefined) { updates.push('position = ?'); values.push(position); }
    if (caption !== undefined) { updates.push('caption = ?'); values.push(caption); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    if (position_x !== undefined) { updates.push('position_x = ?'); values.push(position_x); }
    if (position_y !== undefined) { updates.push('position_y = ?'); values.push(position_y); }
    if (updates.length > 0) { values.push(req.params.id); await pool.query('UPDATE banners SET ' + updates.join(', ') + ' WHERE id = ?', values); }
    res.json({ message: 'بنر به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'بنر حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
