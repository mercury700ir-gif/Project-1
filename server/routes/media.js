const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM media ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const { alt_text, tags } = req.body;
    const fileType = req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : 'document';
    const [result] = await pool.query(
      'INSERT INTO media (file_name, file_path, file_type, file_size, alt_text, tags, uploaded_by) VALUES (?,?,?,?,?,?,?)',
      [req.file.originalname, '/uploads/' + req.file.filename, fileType, req.file.size, alt_text || '', tags || '', req.user.id]
    );
    res.status(201).json({ id: result.insertId, file_path: '/uploads/' + req.file.filename });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { alt_text, tags } = req.body;
    await pool.query('UPDATE media SET alt_text = ?, tags = ? WHERE id = ?', [alt_text || '', tags || '', req.params.id]);
    res.json({ message: 'اطلاعات به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ message: 'فایل حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
