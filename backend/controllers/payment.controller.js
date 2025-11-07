// controllers/payment.controller.js
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const phonepeService = require('../services/phonepe.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');

// exports.initiatePayment = catchAsync(async (req, res) => {
//   const { orderId, amount } = req.body;

//   const order = await Order.findById(orderId);
//   if (!order) throw new ApiError(404, 'Order not found');

//   const paymentId = `pay_${uuidv4()}`;
//   const amountValue = (typeof amount === 'number' && amount > 0) ? amount : order.totAmount;
//   const amountPaise = Math.round(amountValue * 100);

//   // create local payment record first  
//   const payment = await Payment.create({
//     order: order._id,
//     paymentId,
//     amount: amountValue,
//     currency: 'INR',
//     status: 'INITIATED',
//     provider: 'PhonePe',
//     metadata: { orderShopOrderId: order.shopOrderId },
//   });

//   // Update order.payment summary
//   order.payment = {
//     paymentId,
//     status: 'INITIATED',
//     amount: amountValue,
//     currency: 'INR',
//   };
//   await order.save();

//   // Build PhonePe payload (fields per PhonePe sandbox docs)
//   const payload = {
//     merchantId: config.phonepe.merchantId,
//     merchantTransactionId: paymentId,
//     amount: amountPaise,
//     currency: 'INR',
//     redirectUrl: config.phonepe.redirectUrl,
//     callbackUrl: config.phonepe.webhookUrl,
//     merchantUserId: String(order.user),
//     merchantOrderId: order.shopOrderId,
//   };

//   const phonepeResp = await phonepeService.createPayment(payload);

//   res.json({ success: true, data: { payment, phonepeResponse: phonepeResp } });
// });

exports.getPayments = catchAsync(async (req, res) => {
  // admin can fetch all, users only theirs
  const payments = req.admin ? await Payment.find({}).populate('order') : await Payment.find().populate('order').where('order').in((await Order.find({ user: req.user._id })).map(o => o._id));
  res.json({ success: true, count: payments.length, data: payments });
});

exports.initiatePayment = catchAsync(async (req, res) => {
  console.log('Initiate payment request body:', req.body);
  const { orderId, amount } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // Generate a shorter payment ID that fits within 38 characters
  const paymentId = `pay_${Date.now()}`;
  
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

  // Build PhonePe payload with required paymentInstrument
  const payload = {
    merchantId: config.phonepe.merchantId,
    merchantTransactionId: paymentId,
    amount: amountPaise,
    currency: 'INR',
    merchantUserId: String(order.user),
    redirectUrl: `${config.phonepe.redirectUrl}/${paymentId}`,
    redirectMode: 'REDIRECT',
    callbackUrl: config.phonepe.webhookUrl,
    paymentInstrument: {
      type: 'PAY_PAGE'  // This is required for payment page flow
    }
  };
    const payloadBase64 = phonepeService.base64Encode(payload);
  console.log('Generated Base64 payload:', payloadBase64);

  try {
    const phonepeResp = await phonepeService.createPayment(payload);
    
    res.json({ 
      success: true, 
      data: { 
        payment, 
        phonepeResponse: phonepeResp,
        redirectUrl: phonepeResp.data?.instrumentResponse?.redirectInfo?.url 
      } 
    });
    console.log('PhonePe payment initiation response:', phonepeResp);
  } catch (error) {
    // Update payment status to failed
    payment.status = 'FAILED';
    await payment.save();
    
    order.payment.status = 'FAILED';
    await order.save();

    console.error('PhonePe payment initiation failed:', error.response?.data || error.message);
    throw new ApiError(500, `Payment initiation failed: ${error.response?.data?.message || error.message}`);
  }
});


exports.getPaymentStatus = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findOne({ paymentId });
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Optional: also fetch the order if needed
  const order = await Order.findById(payment.order);

  res.json({
    success: true,
    paymentId: payment.paymentId,
    status: payment.status,
    amount: payment.amount,
    orderId: order?._id,
    orderStatus: order?.orderStatus,
  });
});

