// backend/routes/dashboard.js
'use strict';

const express = require('express');
const router  = express.Router();
const {
  getLatest, getRealtimeData, getHistoricalData, getStats, getAlerts, markAlertRead,
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/latest',     getLatest);
router.get('/realtime',   getRealtimeData);
router.get('/historical', getHistoricalData);
router.get('/stats',      getStats);
router.get('/alerts',     getAlerts);
router.patch('/alerts/:id/read', markAlertRead);

module.exports = router;
