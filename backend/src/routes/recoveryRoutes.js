const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');

router.post('/point-in-time', recoveryController.pointInTimeRecovery);

router.get('/logs', recoveryController.getRecoveryLogs);

module.exports = router;