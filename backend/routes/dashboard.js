// backend/routes/dashboard.js
'use strict';

const express = require('express');
const router  = express.Router();
const {
  getLatest, getRealtimeData, getHistoricalData, getStats, getAlerts, markAlertRead,
  getLatestDemo, getRealtimeDemoData, getHistoricalDemoData, getStatsDemoData,
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════════════════════════
// DEMO ROUTES (No authentication required - shows admin user data for testing)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/demo/latest',     getLatestDemo);
router.get('/demo/realtime',   getRealtimeDemoData);
router.get('/demo/historical', getHistoricalDemoData);
router.get('/demo/stats',      getStatsDemoData);

// ══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATED ROUTES (Requires JWT token)
// ══════════════════════════════════════════════════════════════════════════════
router.use(authenticateToken);

router.get('/latest',     getLatest);
router.get('/realtime',   getRealtimeData);
router.get('/historical', getHistoricalData);
router.get('/stats',      getStats);
router.get('/alerts',     getAlerts);
router.patch('/alerts/:id/read', markAlertRead);

module.exports = router;
