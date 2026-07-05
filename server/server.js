const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const pageRoutes = require('./routes/pages');
const bannerRoutes = require('./routes/banners');
const mediaRoutes = require('./routes/media');
const fileRoutes = require('./routes/files');
const pluginRoutes = require('./routes/plugins');
const socialRoutes = require('./routes/social');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - serve frontend
app.use(express.static(path.join(__dirname, '..')));

// Upload directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'خطای داخلی سرور' });
});

app.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log(`  Site: http://localhost:${PORT}/`);
  console.log(`═══════════════════════════════════════\n`);
});

module.exports = app;
