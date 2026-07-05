const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pages ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pages WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'صفحه یافت نشد' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:slug', authMiddleware, adminOnly, async (req, res) => {
  try {
    const fields = ['h1_text','lead_text','kicker_text','btn1_text','btn1_link','btn2_text','btn2_link',
      'section1_title','section1_body','section2_title','section2_body',
      'seo_title','seo_desc','seo_keywords','seo_canonical','image_path','image_alt','image_caption'];
    const updates = []; const values = [];
    fields.forEach(f => {
      const key = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (req.body[key] !== undefined) { updates.push(f + ' = ?'); values.push(req.body[key]); }
    });
    if (updates.length > 0) {
      values.push(req.params.slug);
      await pool.query('UPDATE pages SET ' + updates.join(', ') + ' WHERE slug = ?', values);
    }
    res.json({ message: 'صفحه به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
