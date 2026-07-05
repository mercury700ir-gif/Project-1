const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز - توکن ارائه نشده' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده' });
  }
}

function adminOnly(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
    next();
  } else {
    return res.status(403).json({ error: 'دسترسی فقط برای مدیران' });
  }
}

module.exports = { authMiddleware, adminOnly };
