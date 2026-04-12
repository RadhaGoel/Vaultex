const Backup = require('../models/Backup');
const Recovery = require('../models/Recovery');
const binarySearch = require('../services/binarySearch');

// Point-in-time recovery using binary search
exports.pointInTimeRecovery = async (req, res) => {
  try {
    const { timestamp } = req.body;
    const targetTime = new Date(timestamp);

    const backups = await Backup.find({ status: 'completed' }).sort({ completedAt: 1 });

    if (backups.length === 0) {
      return res.status(404).json({ message: 'No completed backups found' });
    }

    // Binary search service use karo
    const result = binarySearch(backups, targetTime);

    // Recovery log save karo
    await Recovery.create({
      backupId: result ? result._id : backups[0]._id,
      targetTimestamp: targetTime,
      status: result ? 'success' : 'failed'
    });

    if (result) {
      res.json({ message: 'Recovery point found', backup: result });
    } else {
      res.status(404).json({ message: 'No backup found for given timestamp' });
    }

  } catch (err) {
    res.status(500).json({ message: 'Error during recovery' });
  }
};

// Get all recovery logs
exports.getRecoveryLogs = async (req, res) => {
  try {
    const logs = await Recovery.find().populate('backupId').sort({ requestedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recovery logs' });
  }
};