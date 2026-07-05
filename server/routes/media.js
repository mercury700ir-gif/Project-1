const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', (req, res) => { try { res.json(db.prepare('SELECT * FROM media ORDER BY created_at DESC').all()); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const fileType = req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : 'document';
    const r = db.prepare('INSERT INTO media (file_name, file_path, file_type, file_size, alt_text, tags, uploaded_by) VALUES (?,?,?,?,?,?,?)').run(req.file.originalname, '/uploads/' + req.file.filename, fileType, req.file.size, req.body.alt_text || '', req.body.tags || '', req.user.id);
    res.status(201).json({ id: r.lastInsertRowid, file_path: '/uploads/' + req.file.filename });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try { db.prepare('UPDATE media SET alt_text = ?, tags = ? WHERE id = ?').run(req.body.alt_text || '', req.body.tags || '', req.params.id); res.json({ message: 'به‌روزرسانی شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try { db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id); res.json({ message: 'حذف شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
