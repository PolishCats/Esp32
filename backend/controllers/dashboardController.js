// backend/controllers/dashboardController.js
'use strict';

const { pool } = require('../config/database');

// ── Latest reading ────────────────────────────────────────────────────────────
async function getLatest(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, light_value, estado, timestamp
       FROM sensor_data
       WHERE user_id = ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [req.user.id]
    );
    const latest = rows[0] || null;
    return res.json({ success: true, data: latest });
  } catch (err) {
    console.error('[dashboardController.getLatest]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Real-time readings (last N readings for live chart) ───────────────────────
async function getRealtimeData(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const [rows] = await pool.execute(
      `SELECT id, light_value, estado, timestamp
       FROM sensor_data
       WHERE user_id = ?
       ORDER BY timestamp DESC
       LIMIT ${safeLimit}`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows.reverse() });
  } catch (err) {
    console.error('[dashboardController.getRealtimeData]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Historical data (last 24 h) ───────────────────────────────────────────────
async function getHistoricalData(req, res) {
  try {
    const hours = parseInt(req.query.hours || '24', 10);
    const [rows] = await pool.execute(
      `SELECT light_value, estado, timestamp
       FROM sensor_data
       WHERE user_id = ?
         AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
       ORDER BY timestamp ASC`,
      [req.user.id, hours]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[dashboardController.getHistoricalData]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Statistics ────────────────────────────────────────────────────────────────
async function getStats(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
         COUNT(*)                               AS total_readings,
         AVG(light_value)                       AS avg_light,
         MIN(light_value)                       AS min_light,
         MAX(light_value)                       AS max_light,
         SUM(estado = 'oscuro')                 AS count_oscuro,
         SUM(estado = 'medio')                  AS count_medio,
         SUM(estado = 'brillante')              AS count_brillante
       FROM sensor_data
       WHERE user_id = ?
         AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [req.user.id]
    );
    return res.json({ success: true, stats: rows[0] });
  } catch (err) {
    console.error('[dashboardController.getStats]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Alerts (unread) ───────────────────────────────────────────────────────────
async function getAlerts(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, tipo_alerta, valor_luz, timestamp, leida
       FROM alertas
       WHERE user_id = ?
       ORDER BY timestamp DESC
       LIMIT 50`,
      [req.user.id]
    );
    return res.json({ success: true, alerts: rows });
  } catch (err) {
    console.error('[dashboardController.getAlerts]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Mark alert as read ────────────────────────────────────────────────────────
async function markAlertRead(req, res) {
  try {
    await pool.execute(
      'UPDATE alertas SET leida = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[dashboardController.markAlertRead]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                    DEMO MODE (No Auth Required)                           ║
// ║  Note: Shows data from admin user (id=1) for testing purposes             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ── Demo: Latest reading (for testing without auth) ──────────────────────────
async function getLatestDemo(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, light_value, estado, timestamp
       FROM sensor_data
       WHERE user_id = 1
       ORDER BY timestamp DESC
       LIMIT 1`
    );
    const latest = rows[0] || null;
    return res.json({ success: true, data: latest, demo: true });
  } catch (err) {
    console.error('[dashboardController.getLatestDemo]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Demo: Real-time data (for testing without auth) ──────────────────────────
async function getRealtimeDemoData(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const [rows] = await pool.execute(
      `SELECT id, light_value, estado, timestamp
       FROM sensor_data
       WHERE user_id = 1
       ORDER BY timestamp DESC
       LIMIT ${safeLimit}`
    );
    return res.json({ success: true, data: rows.reverse(), demo: true });
  } catch (err) {
    console.error('[dashboardController.getRealtimeDemoData]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Demo: Historical data (for testing without auth) ─────────────────────────
async function getHistoricalDemoData(req, res) {
  try {
    const hours = parseInt(req.query.hours || '24', 10);
    const [rows] = await pool.execute(
      `SELECT light_value, estado, timestamp
       FROM sensor_data
       WHERE user_id = 1
         AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
       ORDER BY timestamp ASC`,
      [hours]
    );
    return res.json({ success: true, data: rows, demo: true });
  } catch (err) {
    console.error('[dashboardController.getHistoricalDemoData]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Demo: Stats (for testing without auth) ────────────────────────────────────
async function getStatsDemoData(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
         COUNT(*)                               AS total_readings,
         AVG(light_value)                       AS avg_light,
         MIN(light_value)                       AS min_light,
         MAX(light_value)                       AS max_light,
         SUM(estado = 'oscuro')                 AS count_oscuro,
         SUM(estado = 'medio')                  AS count_medio,
         SUM(estado = 'brillante')              AS count_brillante
       FROM sensor_data
       WHERE user_id = 1
         AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );
    return res.json({ success: true, stats: rows[0], demo: true });
  } catch (err) {
    console.error('[dashboardController.getStatsDemoData]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

module.exports = { 
  getLatest, 
  getRealtimeData, 
  getHistoricalData, 
  getStats, 
  getAlerts, 
  markAlertRead,
  // Demo mode (no auth required)
  getLatestDemo,
  getRealtimeDemoData,
  getHistoricalDemoData,
  getStatsDemoData,
};
