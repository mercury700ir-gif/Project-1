const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => { try { const [r] = await pool.query('SELECT * FROM pages ORDER BY id'); res.json(r); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });
router.get('/:slug', async (req, res) => { try { const [r] = await pool.query('SELECT * FROM pages WHERE slug = ?', [req.params.slug]); r.length ? res.json(r[0]) : res.status(404).json({ error: 'یافت نشد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.put('/:slug', authMiddleware, adminOnly, async (req, res) => {
  try {
    const fields = ['h1_text','lead_text','kicker_text','btn1_text','btn1_link','btn2_text','btn2_link','section1_title','section1_body','section2_title','section2_body','seo_title','seo_desc','seo_keywords','seo_canonical','image_path','image_alt','image_caption'];
    const u = []; const v = [];
    fields.forEach(f => { const key = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); if (req.body[key] !== undefined) { u.push(f + ' = ?'); v.push(req.body[key]); } });
    if (u.length) { v.push(req.params.slug); await pool.query('UPDATE pages SET ' + u.join(', ') + ' WHERE slug = ?', v); }
    res.json({ message: 'به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
