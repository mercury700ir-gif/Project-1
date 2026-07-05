const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - List posts (public: published only, admin: all)
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch(e) {}
    }

    const where = isAdmin ? '' : "WHERE status = 'published'";
    const [rows] = await pool.query(
      `SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ${where} ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// POST /api/posts - Create post
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, body, excerpt, content_type, video_url, category_id, tags, status, scheduled_at } = req.body;
    const slug = title.replace(/[^\w\u0600-\u06FF\s]/g, '').toLowerCase().replace(/\s+/g, '-');

    const [result] = await pool.query(
      `INSERT INTO posts (title, slug, body, excerpt, content_type, video_url, category_id, author_id, status, scheduled_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, body || '', excerpt || '', content_type || 'article', video_url || null,
       category_id || null, req.user.id, status || 'draft',
       scheduled_at || null, status === 'published' ? new Date() : null]
    );

    if (tags) {
      const tagNames = tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tagName of tagNames) {
        await pool.query('INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, tagName]);
        const [tag] = await pool.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (tag.length > 0) {
          await pool.query('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [result.insertId, tag[0].id]);
        }
      }
    }

    res.status(201).json({ id: result.insertId, title, slug, status: status || 'draft' });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, body, excerpt, content_type, video_url, category_id, status, scheduled_at } = req.body;
    const updates = [];
    const values = [];

    if (title) { updates.push('title = ?'); values.push(title); }
    if (body !== undefined) { updates.push('body = ?'); values.push(body); }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt); }
    if (content_type) { updates.push('content_type = ?'); values.push(content_type); }
    if (video_url !== undefined) { updates.push('video_url = ?'); values.push(video_url); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (status) {
      updates.push('status = ?'); values.push(status);
      if (status === 'published') { updates.push('published_at = NOW()'); }
    }
    if (scheduled_at !== undefined) { updates.push('scheduled_at = ?'); values.push(scheduled_at); }

    if (updates.length > 0) {
      values.push(req.params.id);
      await pool.query('UPDATE posts SET ' + updates.join(', ') + ' WHERE id = ?', values);
    }

    res.json({ message: 'پست به‌روزرسانی شد' });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM post_tags WHERE post_id = ?', [req.params.id]);
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'پست حذف شد' });
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

// POST /api/posts/:id/publish - Publish scheduled post
router.post('/:id/publish', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query("UPDATE posts SET status = 'published', published_at = NOW() WHERE id = ?", [req.params.id]);
    res.json({ message: 'پست منتشر شد' });
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

module.exports = router;
