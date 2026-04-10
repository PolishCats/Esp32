// backend/routes/config.js
'use strict';

const express = require('express');
const router  = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { authenticateToken }       = require('../middleware/auth');

router.use(authenticateToken);

router.get('/',  getConfig);
router.put('/',  updateConfig);

module.exports = router;
