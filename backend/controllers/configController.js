// backend/controllers/configController.js
'use strict';

const { pool } = require('../config/database');

// ── Get config ────────────────────────────────────────────────────────────────
async function getConfig(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM config_usuario WHERE user_id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      // create defaults
      await pool.execute(
        `INSERT IGNORE INTO config_usuario
           (user_id, rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion)
         VALUES (?, 1000, 3000, 200, 3800, 5)`,
        [req.user.id]
      );
      const [newRows] = await pool.execute(
        'SELECT * FROM config_usuario WHERE user_id = ?',
        [req.user.id]
      );
      return res.json({ success: true, config: newRows[0] });
    }
    return res.json({ success: true, config: rows[0] });
  } catch (err) {
    console.error('[configController.getConfig]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

// ── Update config ─────────────────────────────────────────────────────────────
async function updateConfig(req, res) {
  try {
    const {
      rango_oscuro_max,
      rango_medio_max,
      alerta_minima,
      alerta_maxima,
      intervalo_recoleccion,
      retencion_dias,
    } = req.body;

    // Basic validation
    const fields = { rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion, retencion_dias };
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined && (isNaN(val) || val < 0)) {
        return res.status(400).json({ success: false, message: `Valor inválido para ${key}` });
      }
    }

    await pool.execute(
      `UPDATE config_usuario SET
         rango_oscuro_max      = COALESCE(?, rango_oscuro_max),
         rango_medio_max       = COALESCE(?, rango_medio_max),
         alerta_minima         = COALESCE(?, alerta_minima),
         alerta_maxima         = COALESCE(?, alerta_maxima),
         intervalo_recoleccion = COALESCE(?, intervalo_recoleccion),
         retencion_dias        = COALESCE(?, retencion_dias)
       WHERE user_id = ?`,
      [
        rango_oscuro_max  ?? null,
        rango_medio_max   ?? null,
        alerta_minima     ?? null,
        alerta_maxima     ?? null,
        intervalo_recoleccion ?? null,
        retencion_dias    ?? null,
        req.user.id,
      ]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM config_usuario WHERE user_id = ?',
      [req.user.id]
    );
    return res.json({ success: true, config: rows[0] });
  } catch (err) {
    console.error('[configController.updateConfig]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

module.exports = { getConfig, updateConfig };
