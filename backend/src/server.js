const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { fork } = require('child_process');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const Backup = require('./models/Backup');
const generateChecksum = require('./services/checksum');

const backupRoutes = require('./routes/backupRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// Connect to DB
connectDB();

// Routes
app.use('/api/backups', backupRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/stats', statsRoutes);

// Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Cron job - har minute pending backups check karo
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const pendingBackups = await Backup.find({
      status: 'pending',
      scheduledAt: { $lte: now }
    });

    for (let backup of pendingBackups) {
      console.log('Running scheduled backup:', backup.filename);

      if (!fs.existsSync(backup.destination)) {
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'failed',
          completedAt: new Date()
        });
        continue;
      }

      await Backup.findByIdAndUpdate(backup._id, { status: 'running' });

      const backupDir = './backups';
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

      const date = new Date().toISOString().replace(/[:.]/g, '-');
      const zipPath = path.join(backupDir, `${backup.filename}_${date}.zip`);

      const workerPath = path.join(__dirname, 'workers/backupWorker.js');
      const child = fork(workerPath);

      child.send({
        filename: backup.filename,
        destination: backup.destination,
        zipPath,
        backupId: backup._id.toString()
      });

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
    }

  } catch (err) {
    console.log('Cron Error:', err);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});