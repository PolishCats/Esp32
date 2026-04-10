// backend/routes/data.js
'use strict';

/**
 * This route handles incoming sensor data from the ESP32.
 * The ESP32 sends POST /api/data with:
 *   { api_key: "<user_api_key>", light_value: <0-4095> }
 * For simplicity we use a shared api_key = the user's JWT token.
 * Alternatively pass ?token=<jwt> as query param.
 */

const express = require('express');
const router  = express.Router();
const { pool }              = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { manualCleanup }     = require('../utils/dataCleanup');

// ── Determine estado from light value and user config ─────────────────────────
function determineEstado(lightValue, config) {
  const oscuroMax  = config.rango_oscuro_max  || 1000;
  const medioMax   = config.rango_medio_max   || 3000;
  if (lightValue <= oscuroMax)  return 'oscuro';
  if (lightValue <= medioMax)   return 'medio';
  return 'brillante';
}

// ── POST /api/data  (from ESP32) ──────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  try {
    const lightValue = parseInt(req.body.light_value, 10);
    if (isNaN(lightValue) || lightValue < 0 || lightValue > 4095) {
      return res.status(400).json({ success: false, message: 'light_value debe ser un entero 0–4095' });
    }

    // Fetch user config
    const [cfgRows] = await pool.execute(
      'SELECT * FROM config_usuario WHERE user_id = ?',
      [req.user.id]
    );
    const config = cfgRows[0] || {};
    const estado = determineEstado(lightValue, config);

    // Insert reading
    await pool.execute(
      'INSERT INTO sensor_data (user_id, light_value, estado) VALUES (?, ?, ?)',
      [req.user.id, lightValue, estado]
    );

    // Check alert thresholds
    const alertaMin = config.alerta_minima ?? 200;
    const alertaMax = config.alerta_maxima ?? 3800;
    if (lightValue < alertaMin) {
      await pool.execute(
        'INSERT INTO alertas (user_id, tipo_alerta, valor_luz) VALUES (?, ?, ?)',
        [req.user.id, 'minima', lightValue]
      );
    } else if (lightValue > alertaMax) {
      await pool.execute(
        'INSERT INTO alertas (user_id, tipo_alerta, valor_luz) VALUES (?, ?, ?)',
        [req.user.id, 'maxima', lightValue]
      );
    }

    return res.json({ success: true, estado });
  } catch (err) {
    console.error('[data.post]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// ── GET /api/data/simulate  (demo: insert random values) ─────────────────────
router.post('/simulate', authenticateToken, async (req, res) => {
  try {
    const count = Math.min(parseInt(req.body.count || '1', 10), 50);
    const [cfgRows] = await pool.execute(
      'SELECT * FROM config_usuario WHERE user_id = ?',
      [req.user.id]
    );
    const config = cfgRows[0] || {};

    const inserted = [];
    for (let i = 0; i < count; i++) {
      const lightValue = Math.floor(Math.random() * 4096);
      const estado     = determineEstado(lightValue, config);
      await pool.execute(
        'INSERT INTO sensor_data (user_id, light_value, estado) VALUES (?, ?, ?)',
        [req.user.id, lightValue, estado]
      );
      inserted.push({ lightValue, estado });
    }
    return res.json({ success: true, inserted });
  } catch (err) {
    console.error('[data.simulate]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// ── DELETE /api/data/cleanup  (manual cleanup) ────────────────────────────────
router.delete('/cleanup', authenticateToken, async (req, res) => {
  try {
    const days = req.body.days ? parseInt(req.body.days, 10) : undefined;
    const result = await manualCleanup(req.user.id, days);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[data.cleanup]', err);
    return res.status(500).json({ success: false, message: 'Error en limpieza' });
  }
});

module.exports = router;
