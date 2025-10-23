// controllers/payment.controller.js
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const phonepeService = require('../services/phonepe.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');

exports.initiatePayment = catchAsync(async (req, res) => {
  const { orderId, amount } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  const paymentId = `pay_${uuidv4()}`;
  const amountValue = (typeof amount === 'number' && amount > 0) ? amount : order.totAmount;
  const amountPaise = Math.round(amountValue * 100);

  // create local payment record first
  const payment = await Payment.create({
    order: order._id,
    paymentId,
    amount: amountValue,
    currency: 'INR',
    status: 'INITIATED',
    provider: 'PhonePe',
    metadata: { orderShopOrderId: order.shopOrderId },
  });

  // Update order.payment summary
  order.payment = {
    paymentId,
    status: 'INITIATED',
    amount: amountValue,
    currency: 'INR',
  };
  await order.save();

  // Build PhonePe payload (fields per PhonePe sandbox docs)
  const payload = {
    merchantId: config.phonepe.merchantId,
    merchantTransactionId: paymentId,
    amount: amountPaise,
    currency: 'INR',
    redirectUrl: config.phonepe.redirectUrl,
    callbackUrl: config.phonepe.webhookUrl,
    merchantUserId: String(order.user),
    merchantOrderId: order.shopOrderId,
  };

  const phonepeResp = await phonepeService.createPayment(payload);

  res.json({ success: true, data: { payment, phonepeResponse: phonepeResp } });
});

exports.getPayments = catchAsync(async (req, res) => {
  // admin can fetch all, users only theirs
  const payments = req.admin ? await Payment.find({}).populate('order') : await Payment.find().populate('order').where('order').in((await Order.find({ user: req.user._id })).map(o => o._id));
  res.json({ success: true, count: payments.length, data: payments });
});
