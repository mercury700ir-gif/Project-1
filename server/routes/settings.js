const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT setting_key, setting_value, setting_type FROM settings').all();
    const settings = {};
    rows.forEach(r => {
      let val = r.setting_value;
      if (r.setting_type === 'json') try { val = JSON.parse(val); } catch(e) {}
      else if (r.setting_type === 'boolean') val = val === '1' || val === 'true';
      else if (r.setting_type === 'number') val = Number(val);
      settings[r.setting_key] = val;
    });
    res.json(settings);
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/', authMiddleware, adminOnly, (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      db.prepare('INSERT OR REPLACE INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)').run(key, String(value), typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'text');
    }
    res.json({ message: 'تنظیمات ذخیره شد' });
  } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
