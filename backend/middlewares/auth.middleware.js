const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Customer = require('../models/Customer');
const AdminUser = require('../models/AdminUser');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = await Customer.findById(decoded.id);
    
    if (!req.user) {
      throw new ApiError(401, 'User no longer exists');
    }

    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});

exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await Customer.findById(decoded.id);
    } catch (error) {
      throw new ApiError(404, ' Token invalid, continue without user')
    }
  }

  next();
});

exports.adminProtect = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.admin = await AdminUser.findById(decoded.id).select('+roles');
    
    if (!req.admin) {
      throw new ApiError(401, 'Admin user no longer exists');
    }

    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.roles.some(role => roles.includes(role))) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
};
