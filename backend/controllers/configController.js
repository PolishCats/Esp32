// backend/controllers/configController.js
'use strict';

const { pool } = require('../config/database');

const DEFAULT_TIME_CONFIG = {
  hora_modo: 'auto',
  zona_horaria: 'America/Mexico_City',
  formato_hora: '24',
};

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
           (user_id, rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion, max_datos_por_minuto, hora_modo, zona_horaria, formato_hora)
         VALUES (?, 1000, 3000, 200, 3800, 5, 60, 'auto', 'America/Mexico_City', '24')`,
        [req.user.id]
      );
      const [newRows] = await pool.execute(
        'SELECT * FROM config_usuario WHERE user_id = ?',
        [req.user.id]
      );
      return res.json({ success: true, config: newRows[0] });
    }
    return res.json({ success: true, config: { ...DEFAULT_TIME_CONFIG, ...rows[0] } });
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
      hora_modo,
      zona_horaria,
      formato_hora,
    } = req.body;

    // Basic validation
    const fields = { rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion, max_datos_por_minuto, retencion_dias };
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined && (isNaN(val) || val < 0)) {
        return res.status(400).json({ success: false, message: `Valor inválido para ${key}` });
      }
    }

    if (hora_modo !== undefined && !['auto', 'manual'].includes(String(hora_modo))) {
      return res.status(400).json({ success: false, message: 'hora_modo debe ser auto o manual' });
    }

    if (zona_horaria !== undefined && String(zona_horaria).trim().length < 3) {
      return res.status(400).json({ success: false, message: 'zona_horaria inválida' });
    }

    if (formato_hora !== undefined && !['12', '24'].includes(String(formato_hora))) {
      return res.status(400).json({ success: false, message: 'formato_hora debe ser 12 o 24' });
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
         hora_modo             = COALESCE(?, hora_modo),
         zona_horaria          = COALESCE(?, zona_horaria),
         formato_hora          = COALESCE(?, formato_hora)
       WHERE user_id = ?`,
      [
        rango_oscuro_max  ?? null,
        rango_medio_max   ?? null,
        alerta_minima     ?? null,
        alerta_maxima     ?? null,
        intervalo_recoleccion ?? null,
        max_datos_por_minuto ?? null,
        retencion_dias    ?? null,
        hora_modo         ?? null,
        zona_horaria      ?? null,
        formato_hora      ?? null,
        req.user.id,
      ]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM config_usuario WHERE user_id = ?',
      [req.user.id]
    );
    return res.json({ success: true, config: { ...DEFAULT_TIME_CONFIG, ...rows[0] } });
  } catch (err) {
    console.error('[configController.updateConfig]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

module.exports = { getConfig, updateConfig };
