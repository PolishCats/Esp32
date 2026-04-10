// backend/server.js
'use strict';

require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const path         = require('path');
const rateLimit    = require('express-rate-limit');

const { testConnection }   = require('./config/database');
const { scheduleCleanup }  = require('./utils/dataCleanup');

const authRoutes      = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const configRoutes    = require('./routes/config');
const reportsRoutes   = require('./routes/reports');
const dataRoutes      = require('./routes/data');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
      styleSrc:   ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'cdnjs.cloudflare.com'],
      fontSrc:    ["'self'", 'fonts.gstatic.com', 'cdn.jsdelivr.net'],
      imgSrc:     ["'self'", 'data:'],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      200,
  message:  { success: false, message: 'Demasiadas peticiones, intente más tarde.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Demasiados intentos de autenticación.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config',    configRoutes);
app.use('/api/reports',   reportsRoutes);
app.use('/api/data',      dataRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── SPA fallback: serve frontend for all non-API routes ───────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async () => {
  await testConnection();
  scheduleCleanup();
  app.listen(PORT, () => {
    console.log(`[server] ESP32 LDR Monitor running on http://localhost:${PORT}`);
  });
})();
