// backend/utils/dataCleanup.js
'use strict';

const { pool } = require('../config/database');

/**
 * Delete sensor_data and alertas older than retencion_dias for each user.
 * Falls back to DATA_RETENTION_DAYS env var, then to 30 days.
 */
async function runCleanup() {
  try {
    console.log('[dataCleanup] Starting automatic data cleanup…');

    // Get per-user retention settings
    const [configs] = await pool.execute(
      'SELECT user_id, retencion_dias FROM config_usuario'
    );

    const defaultDays = parseInt(process.env.DATA_RETENTION_DAYS || '30', 10);
    let totalSensorDeleted = 0;
    let totalAlertasDeleted = 0;

    for (const cfg of configs) {
      const days = cfg.retencion_dias || defaultDays;

      const [sResult] = await pool.execute(
        `DELETE FROM sensor_data
         WHERE user_id = ?
           AND timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [cfg.user_id, days]
      );
      const [aResult] = await pool.execute(
        `DELETE FROM alertas
         WHERE user_id = ?
           AND timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [cfg.user_id, days]
      );
      totalSensorDeleted  += sResult.affectedRows;
      totalAlertasDeleted += aResult.affectedRows;
    }

    console.log(`[dataCleanup] Done. Removed ${totalSensorDeleted} sensor records, ${totalAlertasDeleted} alert records.`);
  } catch (err) {
    console.error('[dataCleanup] Error during cleanup:', err);
  }
}

/**
 * Manual cleanup triggered by admin via API.
 * Accepts optional `days` override.
 */
async function manualCleanup(userId, days) {
  const retentionDays = days || parseInt(process.env.DATA_RETENTION_DAYS || '30', 10);

  const [sResult] = await pool.execute(
    `DELETE FROM sensor_data
     WHERE user_id = ?
       AND timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [userId, retentionDays]
  );
  const [aResult] = await pool.execute(
    `DELETE FROM alertas
     WHERE user_id = ?
       AND timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [userId, retentionDays]
  );

  return {
    sensorDeleted: sResult.affectedRows,
    alertasDeleted: aResult.affectedRows,
  };
}

/**
 * Schedule automatic cleanup every 24 hours.
 */
function scheduleCleanup() {
  const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 h
  runCleanup(); // run once at startup
  setInterval(runCleanup, INTERVAL_MS);
  console.log('[dataCleanup] Scheduled cleanup every 24 hours.');
}

module.exports = { runCleanup, manualCleanup, scheduleCleanup };
