// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  sku: String,
  name: String,
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 }, // INR
}, { _id: false });

const orderSchema = new mongoose.Schema({
  shopOrderId: { type: String, required: true, unique: true }, // your external order id
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELED', 'PARTIALLY_SHIPPED', 'SHIPPED', 'DELIVERED'],
    default: 'PENDING',  
  },
  items: [orderItemSchema],
  totQty: { type: Number, default: 0 },
  totAmount: { type: Number, default: 0 }, // INR
  buyerEmail: String,
  buyerName: String,
  shippingInfo: mongoose.Schema.Types.Mixed,
  billingInfo: mongoose.Schema.Types.Mixed,
  additionalInfo: mongoose.Schema.Types.Mixed,
  orderDt: { type: Date, default: Date.now },
  lastStatusUpdateDt: { type: Date, default: Date.now },

  // CloudStore metadata
  cloudstore: {
    id: String, // cloudstore order id (if created)
    shopId: String,
    lastResponse: mongoose.Schema.Types.Mixed,
  },

  // payment summary
  payment: {
    paymentId: String, // local merchantPaymentId
    status: { type: String, enum: ['INITIATED','CAPTURED','FAILED','PENDING','NONE'], default: 'NONE' },
    amount: Number,
    currency: { type: String, default: 'INR' },
    capturedAt: Date,
    response: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
