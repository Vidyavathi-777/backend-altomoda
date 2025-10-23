// controllers/webhook.controller.js
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Event = require('../models/Event');
const phonepeService = require('../services/phonepe.service');
const cloudstoreService = require('../services/cloudstore.service');
const catchAsync = require('../utils/catchAsync');

exports.phonepeWebhook = catchAsync(async (req, res) => {
  // PhonePe usually sends { response: "<base64>" } or { request: "<base64>" }
  const base64Response = req.body.response || req.body.request || null;
  const xVerify = req.headers['x-verify'] || req.headers['X-VERIFY'] || req.headers['X-Verify'];

  if (!base64Response || !xVerify) {
    return res.status(400).json({ status: 'error', message: 'Missing body.response or X-VERIFY header' });
  }

  // Verify signature
  const ok = phonepeService.verifyWebhookSignature(base64Response, xVerify);
  if (!ok) {
    console.error('PhonePe webhook signature mismatch');
    return res.status(401).json({ status: 'error', message: 'Invalid signature' });
  }

  // Parse payload and find event id for idempotency (use phonepe transaction id / merchantTransactionId)
  let payload;
  try {
    payload = phonepeService.parseWebhookPayload(base64Response);
  } catch (e) {
    console.error('Invalid webhook payload', e.message);
    return res.status(400).json({ status: 'error', message: 'Invalid payload' });
  }

  const data = payload?.data || payload;
  const merchantTransactionId = data.merchantTransactionId || data.merchantTxnId || data.merchantOrderId;
  const providerTxnId = data.transactionId || data.txnId;
  const eventId = `phonepe_${merchantTransactionId}_${providerTxnId || 'na'}`;

  // Idempotency: if Event exists and processed, return 200
  const existing = await Event.findOne({ eventId });
  if (existing && existing.status === 'PROCESSED') {
    return res.status(200).json({ status: 'ok', message: 'already processed' });
  }

  // Create event record
  const event = existing || await Event.create({ source: 'phonepe', eventId, payload: data });

  try {
    // Find payment
    const payment = await Payment.findOne({ paymentId: merchantTransactionId });
    if (!payment) {
      // if not found: log and return 200 to prevent retries, but keep event as FAILED
      event.status = 'FAILED';
      event.error = 'payment_not_found';
      await event.save();
      console.error('Payment not found for', merchantTransactionId);
      return res.status(200).json({ status: 'ok', message: 'payment not found' });
    }

    // interpret state
    const state = (data.state || data.status || data.responseCode || '').toString().toUpperCase();
    let newStatus = 'PENDING';
    if (state.includes('COMPLETED') || state.includes('SUCCESS')) newStatus = 'SUCCESS';
    else if (state.includes('FAILED') || state.includes('ERROR')) newStatus = 'FAILED';
    else newStatus = 'PENDING';

    payment.status = newStatus === 'SUCCESS' ? 'SUCCESS' : newStatus === 'FAILED' ? 'FAILED' : 'PENDING';
    payment.providerTransactionId = providerTxnId || payment.providerTransactionId;
    payment.response = data;
    await payment.save();

    // Update local order
    const order = await Order.findById(payment.order);
    if (!order) {
      event.status = 'FAILED';
      event.error = 'order_not_found';
      await event.save();
      return res.status(200).json({ status: 'ok', message: 'order not found' });
    }

    if (newStatus === 'SUCCESS') {
      order.orderStatus = 'CONFIRMED';
      order.payment = order.payment || {};
      order.payment.paymentId = payment.paymentId;
      order.payment.status = 'CAPTURED';
      order.payment.amount = payment.amount;
      order.payment.currency = payment.currency;
      order.payment.capturedAt = new Date();
      order.payment.response = data;
      order.lastStatusUpdateDt = new Date();
      await order.save();

      // Mirror update to CloudStore if present
      if (order.cloudstore && order.cloudstore.id && process.env.CLOUDSTORE_SHOP_TOKEN) {
        try {
          await cloudstoreService.updateOrder(order.cloudstore.id, {
            order_status: 'CONFIRMED',
            last_status_update_dt: { $date: new Date().toISOString() },
          });
        } catch (err) {
          console.error('CloudStore confirm failed:', err.message || err);
          // don't throw — we want webhook to succeed; consider creating a retry job in production
        }
      }
    } else if (newStatus === 'FAILED') {
      order.orderStatus = 'CANCELED';
      order.payment = order.payment || {};
      order.payment.paymentId = payment.paymentId;
      order.payment.status = 'FAILED';
      order.payment.response = data;
      order.lastStatusUpdateDt = new Date();
      await order.save();

      if (order.cloudstore && order.cloudstore.id && process.env.CLOUDSTORE_SHOP_TOKEN) {
        try {
          // CloudStore allows PATCH or DELETE; per doc send DELETE if payment rejected, but PATCH to CANCELED is supported as legacy.
          await cloudstoreService.updateOrder(order.cloudstore.id, {
            order_status: 'CANCELED',
            last_status_update_dt: { $date: new Date().toISOString() },
          });
        } catch (err) {
          console.error('CloudStore cancel failed:', err.message || err);
        }
      }
    } else {
      // pending - just attach the response
      order.payment = order.payment || {};
      order.payment.response = data;
      order.lastStatusUpdateDt = new Date();
      await order.save();
    }

    event.status = 'PROCESSED';
    event.processedAt = new Date();
    await event.save();

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    event.status = 'FAILED';
    event.error = err.message || String(err);
    await event.save();
    return res.status(500).json({ status: 'error' });
  }
});
