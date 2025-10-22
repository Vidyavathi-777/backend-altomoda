const mongoose = require('mongoose');
const { PRICING_OVERRIDE_TYPE } = require('../config/constants');

const pricingOverrideSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(PRICING_OVERRIDE_TYPE),
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  rule: {
    marginPct: Number,
    fixedMarkup: Number,
    roundingStrategy: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
  createdBy: String,
}, {
  timestamps: true,
});

pricingOverrideSchema.index({ type: 1, target: 1, active: 1, priority: -1 });

module.exports = mongoose.model('PricingOverride', pricingOverrideSchema);