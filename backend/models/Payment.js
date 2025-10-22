const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_PROVIDER } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  provider: {
    type: String,
    enum: Object.values(PAYMENT_PROVIDER),
    required: true,
  },
  providerPaymentId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.INIT,
  },
  amountInr: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  metadata: mongoose.Schema.Types.Mixed,
  response: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);