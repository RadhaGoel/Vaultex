const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/', backupController.getAllBackups);

router.post('/create', backupController.createBackup);

router.post('/schedule', backupController.scheduleBackup);

router.delete('/:id', backupController.deleteBackup);

module.exports = router;