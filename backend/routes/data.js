// backend/routes/data.js
'use strict';

/**
 * This route handles incoming sensor data from the ESP32.
 * The ESP32 sends POST /api/data with:
 *   { light_value: <0-4095>, intervalo_recoleccion?: <1-3600> }
 * For simplicity we use a shared api_key = the user's JWT token.
 * Alternatively pass ?token=<jwt> as query param.
 */

const express = require('express');
const router  = express.Router();
const { pool }              = require('../config/database');
const { authenticateToken, authenticateDevice } = require('../middleware/auth');
const { manualCleanup }     = require('../utils/dataCleanup');
const { getLedStateForDevice } = require('../controllers/ledController');

// In-memory sliding window per device id for throughput control.
const deviceSendWindow = new Map();
const DEVICE_LIMIT_WINDOW_MS = 10 * 60_000;
const DEVICE_LIMIT_WINDOW_MINUTES = 10;

function canDeviceSend(deviceId, maxPerMinute) {
  const now = Date.now();
  const windowStart = now - DEVICE_LIMIT_WINDOW_MS;
  const previous = deviceSendWindow.get(deviceId) || [];
  const currentWindow = previous.filter(ts => ts >= windowStart);

  if (currentWindow.length >= maxPerMinute) {
    deviceSendWindow.set(deviceId, currentWindow);
    return false;
  }

  currentWindow.push(now);
  deviceSendWindow.set(deviceId, currentWindow);
  return true;
}

// ── Determine estado from light value and user config ─────────────────────────
function determineEstado(lightValue, config) {
  const oscuroMax  = config.rango_oscuro_max  || 1000;
  const medioMax   = config.rango_medio_max   || 3000;
  if (lightValue <= oscuroMax)  return 'oscuro';
  if (lightValue <= medioMax)   return 'medio';
  return 'brillante';
}

// ── POST /api/data  (from ESP32 or authenticated client) ───────────────────────
router.post('/', authenticateDevice, async (req, res) => {
  try {
    const lightValue = parseInt(req.body.light_value, 10);
    const intervalSeconds = req.body.intervalo_recoleccion !== undefined
      ? parseInt(req.body.intervalo_recoleccion, 10)
      : null;

    if (isNaN(lightValue) || lightValue < 0 || lightValue > 4095) {
      return res.status(400).json({ success: false, message: 'light_value debe ser un entero 0–4095' });
    }

    if (intervalSeconds !== null && (isNaN(intervalSeconds) || intervalSeconds < 1 || intervalSeconds > 3600)) {
      return res.status(400).json({ success: false, message: 'intervalo_recoleccion debe ser un entero 1–3600' });
    }

    // Fetch user config
    const [cfgRows] = await pool.execute(
      'SELECT * FROM config_usuario WHERE user_id = ?',
      [req.user.id]
    );
    const config = cfgRows[0] || {};
    const estado = determineEstado(lightValue, config);
    const maxPerMinute = parseInt(config.max_datos_por_minuto ?? 60, 10) || 60;

    if (req.user.device_id && !canDeviceSend(req.user.device_id, maxPerMinute)) {
      return res.status(429).json({
        success: false,
        message: `Límite excedido: máximo ${maxPerMinute} datos por ${DEVICE_LIMIT_WINDOW_MINUTES} minutos para este dispositivo`,
      });
    }

    // If device reports its own sending interval, persist it as the active interval.
    if (intervalSeconds !== null) {
      await pool.execute(
        'UPDATE config_usuario SET intervalo_recoleccion = ? WHERE user_id = ?',
        [intervalSeconds, req.user.id]
      );
    }

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

    return res.json({
      success: true,
      estado,
      intervalo_recoleccion: intervalSeconds ?? config.intervalo_recoleccion ?? null,
      max_datos_por_minuto: maxPerMinute,
    });
  } catch (err) {
    console.error('[data.post]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// ── GET /api/data/simulate  (insert random values) ───────────────────────────
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
    const clearAllAlerts = req.body.clearAllAlerts === true;
    const result = await manualCleanup(req.user.id, { days, clearAllAlerts });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[data.cleanup]', err);
    return res.status(500).json({ success: false, message: 'Error en limpieza' });
  }
});

// ── GET /api/data/led-state (for ESP32 device polling) ───────────────────────
router.get('/led-state', authenticateDevice, getLedStateForDevice);

module.exports = router;
