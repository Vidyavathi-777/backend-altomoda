const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
  },
  // surname: {
  //   type: String,
  //   default: '',
  //   required: true,
  // },
  // country: {
  //   type: String,
  //   default: 'USA',
  //   required: true,
  // },
  dob: Date,
  loyalty: {
    points: { type: Number, default: 0 },
    tier: { type: String, default: 'bronze' },
  },
  preferences: mongoose.Schema.Types.Mixed,
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  verifiedPhone: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  lastLogin: Date,
  tryonimage: {
    type: String,
    default: null,
  },

}, {
  timestamps: true,
});

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);