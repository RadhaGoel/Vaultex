const mongoose = require('mongoose');
require('dotenv').config();

const backupSchema = new mongoose.Schema({
  filename:    { type: String, required: true },
  destination: { type: String, required: true },
  size:        { type: Number, default: 0 },
  checksum:    { type: String, default: '' },
  status:      { type: String, enum: ['pending','running','completed','failed'], default: 'pending' },
  scheduledAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const Backup = mongoose.model('Backup', backupSchema);

const sampleData = [
  {
    filename: 'db-backup-0900',
    destination: './data/db',
    size: 2048,
    checksum: 'a1b2c3d4e5f6',
    status: 'completed',
    scheduledAt: new Date('2026-04-10T09:00:00'),
    completedAt: new Date('2026-04-10T09:00:40')
  },
  {
    filename: 'user-backup-1030',
    destination: './data/users',
    size: 0,
    checksum: '',
    status: 'failed',
    scheduledAt: new Date('2026-04-10T10:30:00'),
    completedAt: new Date('2026-04-10T10:30:15')
  },
  {
    filename: 'media-backup-1130',
    destination: './uploads/media',
    size: 5120,
    checksum: 'b2c3d4e5f6a1',
    status: 'completed',
    scheduledAt: new Date('2026-04-11T11:30:00'),
    completedAt: new Date('2026-04-11T11:30:55')
  },
  {
    filename: 'logs-backup-1200',
    destination: './logs',
    size: 1024,
    checksum: 'c3d4e5f6a1b2',
    status: 'completed',
    scheduledAt: new Date('2026-04-11T12:00:00'),
    completedAt: new Date('2026-04-11T12:00:30')
  },
  {
    filename: 'analytics-backup-1330',
    destination: './data/analytics',
    size: 0,
    checksum: '',
    status: 'failed',
    scheduledAt: new Date('2026-04-12T13:30:00'),
    completedAt: new Date('2026-04-12T13:30:10')
  },
  {
    filename: 'config-backup-1400',
    destination: './config',
    size: 4096,
    checksum: 'd4e5f6a1b2c3',
    status: 'completed',
    scheduledAt: new Date('2026-04-12T14:00:00'),
    completedAt: new Date('2026-04-12T14:00:50')
  },
  {
    filename: 'redis-backup-1500',
    destination: './data/redis',
    size: 256,
    checksum: 'e5f6a1b2c3d4',
    status: 'completed',
    scheduledAt: new Date('2026-04-13T15:00:00'),
    completedAt: new Date('2026-04-13T15:00:25')
  },
  {
    filename: 'system-backup-1600',
    destination: './system',
    size: 128,
    checksum: 'f6a1b2c3d4e5',
    status: 'completed',
    scheduledAt: new Date('2026-04-13T16:00:00'),
    completedAt: new Date('2026-04-13T16:00:20')
  },
  {
    filename: 'running-backup-1700',
    destination: './running',
    size: 0,
    checksum: '',
    status: 'running',
    scheduledAt: new Date('2026-04-14T17:00:00'),
    completedAt: null
  },
  {
    filename: 'pending-backup-1800',
    destination: './pending',
    size: 0,
    checksum: '',
    status: 'pending',
    scheduledAt: new Date('2026-04-15T18:00:00'),
    completedAt: null
  }
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/backupdb';
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    await Backup.deleteMany({});
    console.log('Old data cleared');

    await Backup.insertMany(sampleData);
    console.log(`${sampleData.length} backup records inserted`);

    await mongoose.disconnect();
    console.log('Done! Now run: node src/server.js');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
