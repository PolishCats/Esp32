// backend/middleware/auth.js
'use strict';

const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Express middleware: validates Bearer JWT in Authorization header.
 * Attaches decoded payload to req.user.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

/**
 * Express middleware: validates API Key (from header or query params).
 * Supports JWT OR API Key. Useful for IoT devices (ESP32).
 * Header: Authorization: Bearer <api_key>
 * Query: ?api_key=<api_key>
 */
async function authenticateDevice(req, res, next) {
  try {
    // First try JWT authentication
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
          return next();
        }
      });
    }

    // Then try API Key from header or query
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'Token o API Key requerida' });
    }

    const [rows] = await pool.execute(
      'SELECT dk.*, u.id as user_id, u.username FROM device_api_keys dk JOIN usuarios u ON dk.user_id = u.id WHERE dk.api_key = ? AND dk.is_active = 1',
      [apiKey]
    );

    if (!rows || rows.length === 0) {
      return res.status(403).json({ success: false, message: 'API Key inválida o desactivada' });
    }

    const device = rows[0];
    req.user = { id: device.user_id, username: device.username, device_id: device.id };
    
    // Update last used timestamp
    pool.execute('UPDATE device_api_keys SET last_used_at = NOW() WHERE id = ?', [device.id]).catch(e => {
      console.error('[auth] Error updating last_used_at:', e.message);
    });

    next();
  } catch (error) {
    console.error('[authenticateDevice]', error);
    return res.status(500).json({ success: false, message: 'Error interno de autenticación' });
  }
}

module.exports = { authenticateToken, authenticateDevice };
