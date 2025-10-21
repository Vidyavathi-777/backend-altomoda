const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    sparse: true,
    index: true,
  },
  sessionId: { type: String, index: true },
  items: [{
    sku: { type: String, required: true },
    qty: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
    priceSnapshot: { type: Number, required: true },
  }],
  expiresAt: { type: Date, index: true },
}, { timestamps: true });

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Cart', cartSchema);
