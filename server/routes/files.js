const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM files ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const [result] = await pool.query(
      'INSERT INTO files (file_name, file_path, file_type, file_size, uploaded_by) VALUES (?,?,?,?,?)',
      [req.file.originalname, '/uploads/' + req.file.filename, req.file.mimetype, req.file.size, req.user.id]
    );
    res.status(201).json({ id: result.insertId, file_path: '/uploads/' + req.file.filename });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/:id/download', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'فایل یافت نشد' });
    res.download(process.cwd() + rows[0].file_path, rows[0].file_name);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM files WHERE id = ?', [req.params.id]);
    res.json({ message: 'فایل حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
