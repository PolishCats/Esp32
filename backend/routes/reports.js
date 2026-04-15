// backend/routes/reports.js
'use strict';

const express = require('express');
const router  = express.Router();
const { downloadCSV, downloadPDF, sendByEmail, getPeriodData } = require('../controllers/reportController');
const { authenticateToken }                     = require('../middleware/auth');

router.use(authenticateToken);

router.get('/data',       getPeriodData);
router.get('/csv',        downloadCSV);
router.get('/pdf',        downloadPDF);
router.post('/send-email', sendByEmail);

module.exports = router;
