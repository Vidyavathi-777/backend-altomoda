const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  label: String,
  line1: {
    type: String,
    required: true,
  },
  line2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
    index: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  geo: {
    lat: Number,
    lng: Number,
  },
}, {
  timestamps: true,
});

addressSchema.index({ customerId: 1 });
addressSchema.index({ pincode: 1, city: 1 });

module.exports = mongoose.model('Address', addressSchema);