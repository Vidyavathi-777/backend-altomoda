// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentId: { type: String, required: true, unique: true }, // merchantTransactionId
  amount: { type: Number, required: true }, // INR
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['INITIATED','SUCCESS','FAILED','PENDING'], default: 'INITIATED' },
  provider: { type: String, default: 'PhonePe' },
  providerTransactionId: String,
  metadata: mongoose.Schema.Types.Mixed,
  response: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
