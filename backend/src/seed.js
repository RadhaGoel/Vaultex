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
    filename:    'db-snapshot-1200',
    destination: './data/postgres',
    size:        1024,
    checksum:    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    status:      'completed',
    scheduledAt: new Date('2026-03-27T12:00:00'),
    completedAt: new Date('2026-03-27T12:00:45')
  },
  {
    filename:    'media-backup-1230',
    destination: './uploads/media',
    size:        2048,
    checksum:    'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    status:      'completed',
    scheduledAt: new Date('2026-03-27T12:30:00'),
    completedAt: new Date('2026-03-27T12:30:52')
  },
  {
    filename:    'config-backup-1330',
    destination: './config',
    size:        64,
    checksum:    'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    status:      'completed',
    scheduledAt: new Date('2026-03-27T13:30:00'),
    completedAt: new Date('2026-03-27T13:30:20')
  },
  {
    filename:    'user-data-1300',
    destination: './data/users',
    size:        0,
    checksum:    '',
    status:      'failed',
    scheduledAt: new Date('2026-03-27T13:00:00'),
    completedAt: new Date('2026-03-27T13:00:10')
  },
  {
    filename:    'logs-archive-1400',
    destination: './logs',
    size:        4096,
    checksum:    'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    status:      'completed',
    scheduledAt: new Date('2026-03-27T14:00:00'),
    completedAt: new Date('2026-03-27T14:00:55')
  },
  {
    filename:    'analytics-dump-1430',
    destination: './data/analytics',
    size:        0,
    checksum:    '',
    status:      'failed',
    scheduledAt: new Date('2026-03-27T14:30:00'),
    completedAt: new Date('2026-03-27T14:30:05')
  },
  {
    filename:    'redis-snapshot-1500',
    destination: './data/redis',
    size:        128,
    checksum:    'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
    status:      'completed',
    scheduledAt: new Date('2026-03-27T15:00:00'),
    completedAt: new Date('2026-03-27T15:00:25')
  },
  {
    filename:    'mongo-dump-1530',
    destination: './data/mongo',
    size:        0,
    checksum:    '',
    status:      'running',
    scheduledAt: new Date('2026-03-27T15:30:00'),
    completedAt: null
  },
  {
    filename:    'cdn-assets-1600',
    destination: './public/assets',
    size:        0,
    checksum:    '',
    status:      'pending',
    scheduledAt: new Date('2026-03-28T16:00:00'),
    completedAt: null
  },
  {
    filename:    'full-backup-1700',
    destination: './system',
    size:        0,
    checksum:    '',
    status:      'pending',
    scheduledAt: new Date('2026-03-28T17:00:00'),
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
