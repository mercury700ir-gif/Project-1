const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => { try { const [r] = await pool.query('SELECT * FROM plugins ORDER BY name'); res.json(r); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  try { if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const slug = (req.body.name || req.file.originalname).replace(/[^\w]/g, '-').toLowerCase();
    const [r] = await pool.query('INSERT INTO plugins (name, slug, description, author, version, is_active) VALUES (?,?,?,?,?,?)', [req.body.name || req.file.originalname, slug, req.body.description || '', req.body.author || 'ناشناس', '1.0.0', 0]);
    res.status(201).json({ id: r.insertId }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { const { is_active, settings, description } = req.body; const u = []; const v = [];
    if (is_active !== undefined) { u.push('is_active = ?'); v.push(is_active ? 1 : 0); }
    if (settings !== undefined) { u.push('settings = ?'); v.push(JSON.stringify(settings)); }
    if (description !== undefined) { u.push('description = ?'); v.push(description); }
    if (u.length) { v.push(req.params.id); await pool.query('UPDATE plugins SET ' + u.join(', ') + ' WHERE id = ?', v); }
    res.json({ message: 'به‌روزرسانی شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM plugins WHERE id = ?', [req.params.id]); res.json({ message: 'حذف شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
