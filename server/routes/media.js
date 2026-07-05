const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => { try { const [r] = await pool.query('SELECT * FROM media ORDER BY created_at DESC'); res.json(r); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  try { if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const ft = req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : 'document';
    const [r] = await pool.query('INSERT INTO media (file_name, file_path, file_type, file_size, alt_text, tags, uploaded_by) VALUES (?,?,?,?,?,?,?)', [req.file.originalname, '/uploads/' + req.file.filename, ft, req.file.size, req.body.alt_text || '', req.body.tags || '', req.user.id]);
    res.status(201).json({ id: r.insertId, file_path: '/uploads/' + req.file.filename }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('UPDATE media SET alt_text = ?, tags = ? WHERE id = ?', [req.body.alt_text || '', req.body.tags || '', req.params.id]); res.json({ message: 'به‌روزرسانی شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM media WHERE id = ?', [req.params.id]); res.json({ message: 'حذف شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
