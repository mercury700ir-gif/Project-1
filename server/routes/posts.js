const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    if (token) { try { require('jsonwebtoken').verify(token, process.env.JWT_SECRET); isAdmin = true; } catch(e) {} }
    const where = isAdmin ? '' : "WHERE p.status = 'published'";
    const rows = db.prepare(`SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ${where} ORDER BY p.created_at DESC`).all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const { title, body, excerpt, content_type, video_url, category_id, tags, status, scheduled_at } = req.body;
    const slug = (title || '').replace(/[^\w\u0600-\u06FF\s]/g, '').toLowerCase().replace(/\s+/g, '-');
    const result = db.prepare('INSERT INTO posts (title, slug, body, excerpt, content_type, video_url, category_id, author_id, status, scheduled_at, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(title, slug, body || '', excerpt || '', content_type || 'article', video_url || null, category_id || null, req.user.id, status || 'draft', scheduled_at || null, status === 'published' ? new Date().toISOString() : null);
    if (tags) {
      tags.split(',').map(t => t.trim()).filter(Boolean).forEach(tagName => {
        db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)').run(tagName, tagName);
        const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName);
        if (tag) db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(result.lastInsertRowid, tag.id);
      });
    }
    res.status(201).json({ id: result.lastInsertRowid, title, slug, status: status || 'draft' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { title, body, excerpt, content_type, video_url, category_id, status, scheduled_at } = req.body;
    const updates = []; const values = [];
    if (title) { updates.push('title = ?'); values.push(title); }
    if (body !== undefined) { updates.push('body = ?'); values.push(body); }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt); }
    if (content_type) { updates.push('content_type = ?'); values.push(content_type); }
    if (video_url !== undefined) { updates.push('video_url = ?'); values.push(video_url); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (status) { updates.push('status = ?'); values.push(status); if (status === 'published') updates.push('published_at = datetime("now")'); }
    if (scheduled_at !== undefined) { updates.push('scheduled_at = ?'); values.push(scheduled_at); }
    if (updates.length > 0) { values.push(req.params.id); db.prepare('UPDATE posts SET ' + updates.join(', ') + ' WHERE id = ?').run(...values); }
    res.json({ message: 'پست به‌روزرسانی شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(req.params.id);
    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ message: 'پست حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.post('/:id/publish', authMiddleware, adminOnly, (req, res) => {
  try {
    db.prepare("UPDATE posts SET status = 'published', published_at = datetime('now') WHERE id = ?").run(req.params.id);
    res.json({ message: 'پست منتشر شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
