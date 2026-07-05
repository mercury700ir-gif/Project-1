const express = require('express');
const path = require('path');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', authMiddleware, adminOnly, async (req, res) => { try { const [r] = await pool.query('SELECT * FROM files ORDER BY created_at DESC'); res.json(r); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  try { if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const [r] = await pool.query('INSERT INTO files (file_name, file_path, file_type, file_size, uploaded_by) VALUES (?,?,?,?,?)', [req.file.originalname, '/uploads/' + req.file.filename, req.file.mimetype, req.file.size, req.user.id]);
    res.status(201).json({ id: r.insertId, file_path: '/uploads/' + req.file.filename }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/:id/download', async (req, res) => {
  try { const [r] = await pool.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (!r.length) return res.status(404).json({ error: 'یافت نشد' });
    res.download(path.join(__dirname, '..', '..', r[0].file_path), r[0].file_name); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM files WHERE id = ?', [req.params.id]); res.json({ message: 'حذف شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
