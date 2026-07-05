const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => { try { res.json(db.prepare('SELECT * FROM pages ORDER BY id').all()); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });
router.get('/:slug', (req, res) => { try { const r = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug); r ? res.json(r) : res.status(404).json({ error: 'یافت نشد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); } });

router.put('/:slug', authMiddleware, adminOnly, (req, res) => {
  try {
    const fields = ['h1_text','lead_text','kicker_text','btn1_text','btn1_link','btn2_text','btn2_link','section1_title','section1_body','section2_title','section2_body','seo_title','seo_desc','seo_keywords','seo_canonical','image_path','image_alt','image_caption'];
    const updates = []; const values = [];
    fields.forEach(f => { const key = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); if (req.body[key] !== undefined) { updates.push(f + ' = ?'); values.push(req.body[key]); } });
    if (updates.length > 0) { values.push(req.params.slug); db.prepare('UPDATE pages SET ' + updates.join(', ') + ' WHERE slug = ?').run(...values); }
    res.json({ message: 'صفحه به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
