const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/constants');

const orderSchema = new mongoose.Schema({
  altOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  customerSnapshot: {
    name: String,
    email: String,
    phone: String,
  },
  items: [{
    sku: String,
    title: String,
    qty: Number,
    unitPriceInr: Number,
    unitCostInr: Number,
    sourcePrice: Number,
    tax: Number,
    discount: Number,
  }],
  subtotalInr: Number,
  taxTotalInr: Number,
  shippingInr: Number,
  totalInr: Number,
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING,
    index: true,
  },
  cloudstore: {
    id: String,
    createdAt: Date,
    lastSync: Date,
  },
  payment: {
    provider: String,
    paymentId: String,
    status: String,
    amountInr: Number,
    capturedAt: Date,
  },
  fulfillment: {
    wmsShipmentId: String,
    trackingNumber: String,
    method: String,
  },
  shippingAddress: mongoose.Schema.Types.Mixed,
  billingAddress: mongoose.Schema.Types.Mixed,
  events: [{
    timestamp: Date,
    type: String,
    note: String,
  }],
  idempotencyKey: String,
}, {
  timestamps: true,
});

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Order', orderSchema);