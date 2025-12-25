const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  items: [{
    sku: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

wishlistSchema.index({ userId: 1, 'items.sku': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
