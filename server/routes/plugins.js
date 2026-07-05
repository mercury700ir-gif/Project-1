const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plugins ORDER BY name');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/upload', authMiddleware, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
    const { name, description, author } = req.body;
    const slug = (name || req.file.originalname).replace(/[^\w]/g, '-').toLowerCase();
    const [result] = await pool.query(
      'INSERT INTO plugins (name, slug, description, author, version, is_active) VALUES (?,?,?,?,?,?)',
      [name || req.file.originalname, slug, description || '', author || 'ناشناس', '1.0.0', 0]
    );
    res.status(201).json({ id: result.insertId, name: name || req.file.originalname });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { is_active, settings, code, description } = req.body;
    const updates = []; const values = [];
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    if (settings !== undefined) { updates.push('settings = ?'); values.push(JSON.stringify(settings)); }
    if (code !== undefined) { updates.push('settings = ?'); values.push(JSON.stringify({ code })); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (updates.length > 0) { values.push(req.params.id); await pool.query('UPDATE plugins SET ' + updates.join(', ') + ' WHERE id = ?', values); }
    res.json({ message: 'پلاگین به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM plugins WHERE id = ?', [req.params.id]);
    res.json({ message: 'پلاگین حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
