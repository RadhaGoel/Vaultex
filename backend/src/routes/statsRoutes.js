const express = require('express');
const router = express.Router();
const Backup = require('../models/Backup');

// Get dashboard stats
router.get('/', async (req, res) => {
  try {
    const total = await Backup.countDocuments();
    const completed = await Backup.countDocuments({ status: 'completed' });
    const failed = await Backup.countDocuments({ status: 'failed' });
    const pending = await Backup.countDocuments({ status: 'pending' });
    const running = await Backup.countDocuments({ status: 'running' });

    const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    res.json({ total, completed, failed, pending, running, successRate });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;