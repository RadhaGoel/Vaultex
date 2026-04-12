const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');

// Point-in-time recovery
router.post('/point-in-time', recoveryController.pointInTimeRecovery);

// Get recovery logs
router.get('/logs', recoveryController.getRecoveryLogs);

module.exports = router;