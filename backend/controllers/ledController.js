'use strict';

const { pool } = require('../config/database');

const DEFAULT_LED_PIN = 32;

async function ensureLedStateRow(userId) {
  await pool.execute(
    `INSERT IGNORE INTO led_control_states (user_id, led_pin, is_on)
     VALUES (?, ?, 0)`,
    [userId, DEFAULT_LED_PIN]
  );
}

async function getLedState(userId) {
  await ensureLedStateRow(userId);
  const [rows] = await pool.execute(
    `SELECT user_id, led_pin, is_on, updated_at
     FROM led_control_states
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || { user_id: userId, led_pin: DEFAULT_LED_PIN, is_on: 0, updated_at: null };
}

async function getLedStateForUser(req, res) {
  try {
    const state = await getLedState(req.user.id);
    return res.json({
      success: true,
      data: {
        led_pin: state.led_pin,
        is_on: !!state.is_on,
        updated_at: state.updated_at,
      },
    });
  } catch (err) {
    console.error('[ledController.getLedStateForUser]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

async function setLedStateForUser(req, res) {
  try {
    const { is_on } = req.body;
    if (typeof is_on !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_on debe ser booleano' });
    }

    await ensureLedStateRow(req.user.id);
    await pool.execute(
      `UPDATE led_control_states
       SET is_on = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [is_on ? 1 : 0, req.user.id]
    );

    const state = await getLedState(req.user.id);
    return res.json({
      success: true,
      message: `LED ${state.is_on ? 'encendido' : 'apagado'}`,
      data: {
        led_pin: state.led_pin,
        is_on: !!state.is_on,
        updated_at: state.updated_at,
      },
    });
  } catch (err) {
    console.error('[ledController.setLedStateForUser]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

async function getLedStateForDevice(req, res) {
  try {
    const state = await getLedState(req.user.id);
    return res.json({
      success: true,
      led_pin: state.led_pin,
      is_on: !!state.is_on,
      updated_at: state.updated_at,
    });
  } catch (err) {
    console.error('[ledController.getLedStateForDevice]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

module.exports = {
  getLedStateForUser,
  setLedStateForUser,
  getLedStateForDevice,
};
