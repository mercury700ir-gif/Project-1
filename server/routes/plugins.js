const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', (req, res) => { try { res.json(db.prepare('SELECT * FROM plugins ORDER BY name').all()); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const slug = (req.body.name || req.file.originalname).replace(/[^\w]/g, '-').toLowerCase();
    const r = db.prepare('INSERT INTO plugins (name, slug, description, author, version, is_active) VALUES (?,?,?,?,?,?)').run(req.body.name || req.file.originalname, slug, req.body.description || '', req.body.author || 'ناشناس', '1.0.0', 0);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { is_active, settings, description } = req.body;
    const u = []; const v = [];
    if (is_active !== undefined) { u.push('is_active = ?'); v.push(is_active ? 1 : 0); }
    if (settings !== undefined) { u.push('settings = ?'); v.push(JSON.stringify(settings)); }
    if (description !== undefined) { u.push('description = ?'); v.push(description); }
    if (u.length > 0) { v.push(req.params.id); db.prepare('UPDATE plugins SET ' + u.join(', ') + ' WHERE id = ?').run(...v); }
    res.json({ message: 'به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try { db.prepare('DELETE FROM plugins WHERE id = ?').run(req.params.id); res.json({ message: 'حذف شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
