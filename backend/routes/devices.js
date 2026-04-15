// backend/routes/devices.js
'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createApiKey,
  listApiKeys,
  deleteApiKey,
  toggleApiKey
} = require('../controllers/deviceController');

// All routes require JWT authentication
router.use(authenticateToken);

// Create new API Key for device
router.post('/keys', createApiKey);

// List all API Keys for current user
router.get('/keys', listApiKeys);

// Delete API Key
router.delete('/keys/:id', deleteApiKey);

// Toggle API Key active/inactive
router.patch('/keys/:id/toggle', toggleApiKey);

module.exports = router;
