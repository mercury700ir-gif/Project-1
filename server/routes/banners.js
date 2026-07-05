const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => { try { res.json(db.prepare('SELECT * FROM banners ORDER BY sort_order, id').all()); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const { title, image_path, link_url, position, caption, position_x, position_y } = req.body;
    const r = db.prepare('INSERT INTO banners (title, image_path, link_url, position, caption, position_x, position_y) VALUES (?,?,?,?,?,?,?)').run(title, image_path||null, link_url||null, position||'custom', caption||null, position_x||50, position_y||50);
    res.status(201).json({ id: r.lastInsertRowid, title });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { title, image_path, link_url, position, caption, is_active, position_x, position_y } = req.body;
    const u = []; const v = [];
    if (title !== undefined) { u.push('title = ?'); v.push(title); }
    if (image_path !== undefined) { u.push('image_path = ?'); v.push(image_path); }
    if (link_url !== undefined) { u.push('link_url = ?'); v.push(link_url); }
    if (position !== undefined) { u.push('position = ?'); v.push(position); }
    if (caption !== undefined) { u.push('caption = ?'); v.push(caption); }
    if (is_active !== undefined) { u.push('is_active = ?'); v.push(is_active ? 1 : 0); }
    if (position_x !== undefined) { u.push('position_x = ?'); v.push(position_x); }
    if (position_y !== undefined) { u.push('position_y = ?'); v.push(position_y); }
    if (u.length > 0) { v.push(req.params.id); db.prepare('UPDATE banners SET ' + u.join(', ') + ' WHERE id = ?').run(...v); }
    res.json({ message: 'بنر به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try { db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id); res.json({ message: 'بنر حذف شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
