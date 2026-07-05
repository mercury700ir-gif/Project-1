const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    if (token) { try { require('jsonwebtoken').verify(token, process.env.JWT_SECRET); isAdmin = true; } catch(e) {} }
    const where = isAdmin ? '' : "WHERE p.status = 'published'";
    const [r] = await pool.query(`SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ${where} ORDER BY p.created_at DESC`);
    res.json(r);
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [r] = await pool.query('SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?', [req.params.id]);
    r.length ? res.json(r[0]) : res.status(404).json({ error: 'یافت نشد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, body, excerpt, content_type, video_url, category_id, tags, status, scheduled_at } = req.body;
    const slug = (title || '').replace(/[^\w\u0600-\u06FF\s]/g, '').toLowerCase().replace(/\s+/g, '-');
    const [r] = await pool.query('INSERT INTO posts (title, slug, body, excerpt, content_type, video_url, category_id, author_id, status, scheduled_at, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [title, slug, body || '', excerpt || '', content_type || 'article', video_url || null, category_id || null, req.user.id, status || 'draft', scheduled_at || null, status === 'published' ? new Date() : null]);
    if (tags) {
      for (const t of tags.split(',').map(s => s.trim()).filter(Boolean)) {
        await pool.query('INSERT IGNORE INTO tags (name, slug) VALUES (?,?)', [t, t]);
        const [tag] = await pool.query('SELECT id FROM tags WHERE name = ?', [t]);
        if (tag.length) await pool.query('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?,?)', [r.insertId, tag[0].id]);
      }
    }
    res.status(201).json({ id: r.insertId, title, slug, status: status || 'draft' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, body, excerpt, content_type, video_url, category_id, status, scheduled_at } = req.body;
    const u = []; const v = [];
    if (title) { u.push('title = ?'); v.push(title); }
    if (body !== undefined) { u.push('body = ?'); v.push(body); }
    if (excerpt !== undefined) { u.push('excerpt = ?'); v.push(excerpt); }
    if (content_type) { u.push('content_type = ?'); v.push(content_type); }
    if (video_url !== undefined) { u.push('video_url = ?'); v.push(video_url); }
    if (category_id !== undefined) { u.push('category_id = ?'); v.push(category_id); }
    if (status) { u.push('status = ?'); v.push(status); if (status === 'published') u.push('published_at = NOW()'); }
    if (scheduled_at !== undefined) { u.push('scheduled_at = ?'); v.push(scheduled_at); }
    if (u.length) { v.push(req.params.id); await pool.query('UPDATE posts SET ' + u.join(', ') + ' WHERE id = ?', v); }
    res.json({ message: 'به‌روزرسانی شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM post_tags WHERE post_id = ?', [req.params.id]); await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]); res.json({ message: 'حذف شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/:id/publish', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query("UPDATE posts SET status = 'published', published_at = NOW() WHERE id = ?", [req.params.id]); res.json({ message: 'منتشر شد' }); }
  catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
