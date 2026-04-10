// backend/controllers/authController.js
'use strict';

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET     = process.env.JWT_SECRET     || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS    = 10;

// ── Register ──────────────────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ success: false, message: 'Username debe tener entre 3 y 50 caracteres' });
    }
    if (email.length > 254 || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ success: false, message: 'Email inválido' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Usuario o email ya registrado' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
      [username, email.toLowerCase(), hash]
    );

    // Create default config for new user
    await pool.execute(
      `INSERT IGNORE INTO config_usuario
         (user_id, rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion)
       VALUES (?, 1000, 3000, 200, 3800, 5)`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('[authController.register]', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username y contraseña requeridos' });
    }

    const [rows] = await pool.execute(
      'SELECT id, username, email, password FROM usuarios WHERE username = ? OR email = ?',
      [username, username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

// ── Get current user ──────────────────────────────────────────────────────────
async function me(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('[authController.me]', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

module.exports = { register, login, me };
