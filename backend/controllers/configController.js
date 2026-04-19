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
           (user_id, rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion, max_datos_por_minuto, hora_programada)
         VALUES (?, 1000, 3000, 200, 3800, 5, 60, '12:00:00')`,
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
      max_datos_por_minuto,
      retencion_dias,
      hora_programada,
    } = req.body;

    // Basic validation
    const fields = { rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion, max_datos_por_minuto, retencion_dias };
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined && (isNaN(val) || val < 0)) {
        return res.status(400).json({ success: false, message: `Valor inválido para ${key}` });
      }
    }

    if (hora_programada !== undefined && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(String(hora_programada))) {
      return res.status(400).json({ success: false, message: 'hora_programada debe tener formato HH:MM' });
    }

    if (max_datos_por_minuto !== undefined && (max_datos_por_minuto < 1 || max_datos_por_minuto > 1200)) {
      return res.status(400).json({ success: false, message: 'max_datos_por_minuto debe estar entre 1 y 1200' });
    }

    await pool.execute(
      `UPDATE config_usuario SET
         rango_oscuro_max      = COALESCE(?, rango_oscuro_max),
         rango_medio_max       = COALESCE(?, rango_medio_max),
         alerta_minima         = COALESCE(?, alerta_minima),
         alerta_maxima         = COALESCE(?, alerta_maxima),
         intervalo_recoleccion = COALESCE(?, intervalo_recoleccion),
         max_datos_por_minuto  = COALESCE(?, max_datos_por_minuto),
         retencion_dias        = COALESCE(?, retencion_dias),
         hora_programada       = COALESCE(?, hora_programada)
       WHERE user_id = ?`,
      [
        rango_oscuro_max  ?? null,
        rango_medio_max   ?? null,
        alerta_minima     ?? null,
        alerta_maxima     ?? null,
        intervalo_recoleccion ?? null,
        max_datos_por_minuto ?? null,
        retencion_dias    ?? null,
        hora_programada   ?? null,
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
