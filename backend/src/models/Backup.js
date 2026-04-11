const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  checksum: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Backup', backupSchema);