const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// Get all backups
router.get('/', backupController.getAllBackups);

// Create immediate backup
router.post('/create', backupController.createBackup);

module.exports = router;