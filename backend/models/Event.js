// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  source: { type: String }, // e.g., 'phonepe'
  eventId: { type: String, required: true, unique: true },
  payload: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['PENDING','PROCESSED','FAILED'], default: 'PENDING' },
  processedAt: Date,
  error: String,
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
