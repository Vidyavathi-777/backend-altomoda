const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../config/constants');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  payload: mongoose.Schema.Types.Mixed,
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: Date,
  status: {
    type: String,
    enum: Object.values(EVENT_STATUS),
    default: EVENT_STATUS.PENDING,
    index: true,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  error: String,
}, {
  timestamps: true,
});

eventSchema.index({ status: 1, receivedAt: 1 });

module.exports = mongoose.model('Event', eventSchema);