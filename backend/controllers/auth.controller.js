// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const Session = require('../models/Session');
const Address = require('../models/Address');
const config = require('../config/env');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const notificationService = require('../services/notification.service');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await Customer.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const customer = await Customer.create({
    name,
    email,
    password,
    phone,
  });

  const token = generateToken(customer._id);
  const refreshToken = generateRefreshToken(customer._id);

  // Store refresh token
  await Session.create({
    userId: customer._id,
    refreshTokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    },
  });

  // Send welcome email
  await notificationService.sendWelcomeEmail(customer);

  res.status(201).json({
    status: 'success',
    data: {
      userId: customer._id,
      email: customer.email,
      token,
      refreshToken,
    },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email }).select('+password');
  if (!customer || !(await customer.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  if (customer.status !== 'active') {
    throw new ApiError(403, 'Account is not active');
  }

  const token = generateToken(customer._id);
  const refreshToken = generateRefreshToken(customer._id);

  // Store refresh token
  await Session.create({
    userId: customer._id,
    refreshTokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    },
  });

  // Update last login
  customer.lastLogin = new Date();
  await customer.save();

  res.json({
    status: 'success',
    data: {
      token,
      refreshToken,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    },
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const session = await Session.findOne({
    userId: decoded.id,
    refreshTokenHash: tokenHash,
  });

  if (!session) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Generate new tokens
  const newToken = generateToken(decoded.id);
  const newRefreshToken = generateRefreshToken(decoded.id);

  // Update session
  session.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await session.save();

  res.json({
    status: 'success',
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
    },
  });
});

exports.logout = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    const decoded = jwt.verify(token, config.jwt.secret);
    await Session.deleteMany({ userId: decoded.id });
  }

  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

exports.getMe = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.user._id);
  const addresses = await Address.find({ customerId: req.user._id });

  res.json({
    status: 'success',
    data: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      loyalty: customer.loyalty,
      addresses,
    },
  });
});

exports.addAddress = catchAsync(async (req, res) => {
  const addressData = {
    ...req.body,
    customerId: req.user._id,
  };

  // If this is the first address or marked as default, set it as default
  const existingAddresses = await Address.countDocuments({ customerId: req.user._id });
  if (existingAddresses === 0 || req.body.isDefault) {
    // Remove default from other addresses
    await Address.updateMany(
      { customerId: req.user._id },
      { $set: { isDefault: false } }
    );
    addressData.isDefault = true;
  }

  const address = await Address.create(addressData);

  res.status(201).json({
    status: 'success',
    data: address,
  });
});

exports.updateAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    customerId: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  // If marking as default, remove default from others
  if (req.body.isDefault) {
    await Address.updateMany(
      { customerId: req.user._id, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );
  }

  Object.assign(address, req.body);
  await address.save();

  res.json({
    status: 'success',
    data: address,
  });
});

exports.deleteAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOneAndDelete({
    _id: addressId,
    customerId: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  // If deleted address was default, make another address default
  if (address.isDefault) {
    const nextAddress = await Address.findOne({ customerId: req.user._id });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  res.json({
    status: 'success',
    message: 'Address deleted successfully',
  });
});