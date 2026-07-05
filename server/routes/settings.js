const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try { const [rows] = await pool.query('SELECT setting_key, setting_value, setting_type FROM settings');
    const s = {}; rows.forEach(r => { let v = r.setting_value; if (r.setting_type === 'json') try { v = JSON.parse(v); } catch(e) {} else if (r.setting_type === 'boolean') v = v === '1' || v === 'true'; else if (r.setting_type === 'number') v = Number(v); s[r.setting_key] = v; }); res.json(s); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

router.put('/', authMiddleware, adminOnly, async (req, res) => {
  try { for (const [k, v] of Object.entries(req.body)) {
    await pool.query('INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [k, String(v), typeof v === 'boolean' ? 'boolean' : typeof v === 'number' ? 'number' : 'text']); }
    res.json({ message: 'ذخیره شد' }); } catch (e) { res.status(500).json({ error: 'خطای سرور' }); }
});

module.exports = router;
