const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// Get all backups
router.get('/', backupController.getAllBackups);

// Create immediate backup
router.post('/create', backupController.createBackup);

// Schedule backup
router.post('/schedule', backupController.scheduleBackup);

// Delete backup
router.delete('/:id', backupController.deleteBackup);

module.exports = router;