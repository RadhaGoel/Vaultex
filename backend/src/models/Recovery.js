const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema({
  backupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Backup',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  targetTimestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
});

module.exports = mongoose.model('Recovery', recoverySchema);