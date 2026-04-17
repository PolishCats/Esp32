// backend/server.js
'use strict';

require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const path         = require('path');
const fs           = require('fs');
const rateLimit    = require('express-rate-limit');

const { testConnection, ensureSchemaCompatibility }   = require('./config/database');
const { scheduleCleanup }  = require('./utils/dataCleanup');

const authRoutes      = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const configRoutes    = require('./routes/config');
const reportsRoutes   = require('./routes/reports');
const dataRoutes      = require('./routes/data');
const devicesRoutes   = require('./routes/devices');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const frontendPathCandidates = [
  path.join(__dirname, '..', 'frontend'),
  path.join(__dirname, 'frontend'),
  '/frontend',
];

const FRONTEND_DIR = frontendPathCandidates.find((dirPath) => fs.existsSync(path.join(dirPath, 'index.html')));

// Codespaces/reverse proxy environments set X-Forwarded-For.
app.set('trust proxy', 1);

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
  max:      parseInt(process.env.API_RATE_LIMIT_MAX || '1500', 10),
  // Dashboard polling and device ingestion are controlled by dedicated limiters.
  skip: (req) => req.path.startsWith('/api/dashboard') || req.path.startsWith('/api/data'),
  message:  { success: false, message: 'Demasiadas peticiones, intente más tarde.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
  message:  { success: false, message: 'Demasiados intentos de autenticación.' },
});

const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(process.env.DASHBOARD_RATE_LIMIT_MAX || '5000', 10),
  message:  { success: false, message: 'Demasiadas peticiones al dashboard, intente más tarde.' },
});

const dataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(process.env.DATA_RATE_LIMIT_MAX || '8000', 10),
  message:  { success: false, message: 'Demasiadas lecturas enviadas, intente más tarde.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/dashboard/', dashboardLimiter);
app.use('/api/data/', dataLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static frontend ───────────────────────────────────────────────────────────
if (FRONTEND_DIR) {
  app.use(express.static(FRONTEND_DIR));
} else {
  console.warn('[server] Frontend directory not found. Static files are disabled.');
}

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config',    configRoutes);
app.use('/api/reports',   reportsRoutes);
app.use('/api/data',      dataRoutes);
app.use('/api/devices',   devicesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── SPA fallback: serve frontend for all non-API routes ───────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
  }
  if (!FRONTEND_DIR) {
    return res.status(503).json({ success: false, message: 'Frontend no disponible en este entorno' });
  }
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async () => {
  await testConnection();
  await ensureSchemaCompatibility();
  scheduleCleanup();
  app.listen(PORT, () => {
    console.log(`[server] ESP32 LDR Monitor running on http://localhost:${PORT}`);
  });
})();
