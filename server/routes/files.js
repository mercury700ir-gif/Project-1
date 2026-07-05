const express = require('express');
const path = require('path');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', authMiddleware, adminOnly, (req, res) => { try { res.json(db.prepare('SELECT * FROM files ORDER BY created_at DESC').all()); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const r = db.prepare('INSERT INTO files (file_name, file_path, file_type, file_size, uploaded_by) VALUES (?,?,?,?,?)').run(req.file.originalname, '/uploads/' + req.file.filename, req.file.mimetype, req.file.size, req.user.id);
    res.status(201).json({ id: r.lastInsertRowid, file_path: '/uploads/' + req.file.filename });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/:id/download', (req, res) => {
  try {
    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
    if (!file) return res.status(404).json({ error: 'یافت نشد' });
    res.download(path.join(__dirname, '..', '..', file.file_path), file.file_name);
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try { db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id); res.json({ message: 'حذف شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
