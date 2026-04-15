// backend/controllers/deviceController.js
'use strict';

const crypto = require('crypto');
const { pool } = require('../config/database');

/**
 * Generate random API Key (256-bit hex string = 64 chars)
 */
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/devices/keys - Create new API Key for device
 * Request: { device_name: "string" }
 */
async function createApiKey(req, res) {
  try {
    const { device_name } = req.body;

    if (!device_name || device_name.trim().length === 0 || device_name.length > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'device_name requerido y debe tener entre 1 y 100 caracteres' 
      });
    }

    const apiKey = generateApiKey();

    await pool.execute(
      'INSERT INTO device_api_keys (user_id, device_name, api_key) VALUES (?, ?, ?)',
      [req.user.id, device_name.trim(), apiKey]
    );

    return res.json({
      success: true,
      message: 'API Key creada exitosamente',
      data: {
        device_name,
        api_key: apiKey,
        warning: 'Guarda esta API Key en un lugar seguro. No podrá ser recuperada.'
      }
    });
  } catch (error) {
    console.error('[deviceController.createApiKey]', error);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

/**
 * GET /api/devices/keys - List all API Keys for user
 */
async function listApiKeys(req, res) {
  try {
    const fullView = req.query.full === '1';
    const [rows] = await pool.execute(
      'SELECT id, device_name, api_key, is_active, created_at, last_used_at FROM device_api_keys WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    return res.json({
      success: true,
      data: rows.map(key => ({
        id: key.id,
        device_name: key.device_name,
        api_key: fullView ? key.api_key : key.api_key.substring(0, 8) + '...',
        is_active: key.is_active,
        created_at: key.created_at,
        last_used_at: key.last_used_at
      }))
    });
  } catch (error) {
    console.error('[deviceController.listApiKeys]', error);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

/**
 * DELETE /api/devices/keys/:id - Delete API Key
 */
async function deleteApiKey(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id FROM device_api_keys WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'API Key no encontrada' });
    }

    await pool.execute(
      'DELETE FROM device_api_keys WHERE id = ?',
      [id]
    );

    return res.json({ success: true, message: 'API Key eliminada' });
  } catch (error) {
    console.error('[deviceController.deleteApiKey]', error);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

/**
 * PATCH /api/devices/keys/:id/toggle - Enable/Disable API Key
 */
async function toggleApiKey(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id, is_active FROM device_api_keys WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'API Key no encontrada' });
    }

    const newStatus = rows[0].is_active ? 0 : 1;

    await pool.execute(
      'UPDATE device_api_keys SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    return res.json({ 
      success: true, 
      message: `API Key ${newStatus ? 'activada' : 'desactivada'}`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('[deviceController.toggleApiKey]', error);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

module.exports = { 
  createApiKey, 
  listApiKeys, 
  deleteApiKey, 
  toggleApiKey 
};
