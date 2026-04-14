const Backup = require('../models/Backup');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');
const generateChecksum = require('../services/checksum');

exports.getAllBackups = async (req, res) => {
  try {
    const backups = await Backup.find().sort({ scheduledAt: -1 });
    res.json(backups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching backups' });
  }
};
 
exports.createBackup = async (req, res) => {
  try {
    const { filename, destination } = req.body;
    if (!fs.existsSync(destination)) {
      const backup = new Backup({
        filename,
        destination,
        status: 'failed',
        scheduledAt: new Date(),
        completedAt: new Date()
      });
      await backup.save();
      return res.json({ message: 'Backup failed! Source path does not exist.', backupId: backup._id });
    }

    const backup = new Backup({
      filename,
      destination,
      status: 'running',
      scheduledAt: new Date()
    });
    await backup.save();

    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFilename = `${filename}_${date}.zip`;
    const zipPath = path.join(backupDir, zipFilename);

    const workerPath = path.join(__dirname, '../workers/backupWorker.js');
    const child = fork(workerPath);

    child.send({ filename, destination, zipPath, backupId: backup._id.toString() });

    child.on('message', async (result) => {
      if (result.success) {
        const checksum = generateChecksum(zipPath);
        const stats = fs.statSync(zipPath);
        const sizeKB = Math.round(stats.size / 1024) || 1;

        await Backup.findByIdAndUpdate(backup._id, {
          status: 'completed',
          checksum,
          size: sizeKB,
          completedAt: new Date()
        });
      } else {
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'failed',
          completedAt: new Date()
        });
      }
      child.kill();
    });

    child.on('error', async () => {
      await Backup.findByIdAndUpdate(backup._id, { status: 'failed' });
    });

    res.json({ message: 'Backup started!', backupId: backup._id });

  } catch (err) {
    res.status(500).json({ message: 'Error creating backup' });
  }
};

exports.scheduleBackup = async (req, res) => {
  try {
    const { filename, destination, scheduledAt } = req.body;
    const backup = new Backup({
      filename,
      destination,
      status: 'pending',
      scheduledAt: new Date(scheduledAt)
    });
    await backup.save();
    res.json({ message: 'Backup scheduled!', backupId: backup._id });
  } catch (err) {
    res.status(500).json({ message: 'Error scheduling backup' });
  }
};


exports.deleteBackup = async (req, res) => {
  try {
    await Backup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Backup deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting backup' });
  }
};