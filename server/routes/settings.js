const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value, setting_type, category FROM settings');
    const settings = {};
    rows.forEach(r => {
      let val = r.setting_value;
      if (r.setting_type === 'json') try { val = JSON.parse(val); } catch(e) {}
      else if (r.setting_type === 'boolean') val = val === '1' || val === 'true';
      else if (r.setting_type === 'number') val = Number(val);
      settings[r.setting_key] = val;
    });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, String(value), typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'text']
      );
    }
    res.json({ message: 'تنظیمات ذخیره شد' });
  } catch (err) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
