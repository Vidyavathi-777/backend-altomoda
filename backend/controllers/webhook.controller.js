// // controllers/webhook.controller.js
// const Payment = require('../models/Payment');
// const Order = require('../models/Order');
// const Event = require('../models/Event');
// const phonepeService = require('../services/phonepe.service');
// // const cloudstoreService = require('../services/cloudstore.service'); // ❌ commented out
// const catchAsync = require('../utils/catchAsync');

// exports.phonepeWebhook = catchAsync(async (req, res) => {
//   console.log('phonepe webhook received');
//   console.log('headers:', req.headers);
//   console.log('body:', req.body);

//   const base64Response = req.body.response || req.body.request || null;
//     if (!base64Response) {
//     console.error('❌ Missing base64 response field');
//     return res.status(400).json({ status: 'error', message: 'Missing base64 response field' });
//   }
//   // const payloadJson = Buffer.from(base64Response, 'base64').toString('utf8');
//   console.log('Decoded webhook payload JSON string:', payloadJson);
//   const xVerify = req.headers['x-verify'] || req.headers['X-VERIFY'] || req.headers['X-Verify'];
//     if (!isValid) {
//     console.error('❌ Invalid signature');
//     return res.status(401).json({ status: 'error', message: 'Invalid signature' });
//   }

//   if (!base64Response || !xVerify) {
//     console.error('Missing body.response or X-VERIFY header');
//     return res.status(400).json({ status: 'error', message: 'Missing body.response or X-VERIFY header' });
//   }

//   const ok = phonepeService.verifyWebhookSignature(base64Response, xVerify);
//   if (!ok) {
//     console.error('PhonePe webhook signature mismatch');
//     return res.status(401).json({ status: 'error', message: 'Invalid signature' });
//   }

//   let payload;
//   try {
//     payload = phonepeService.parseWebhookPayload(base64Response);
//     console.log('Parsed webhook payload:', JSON.stringify(payload, null, 2));
//   } catch (e) {
//     console.error('Invalid webhook payload', e.message);
//     return res.status(400).json({ status: 'error', message: 'Invalid payload' });
//   }

//   const data = payload?.data || payload;
//   const merchantTransactionId = data.merchantTransactionId || data.merchantTxnId || data.merchantOrderId;
//   const providerTxnId = data.transactionId || data.txnId;
//   const eventId = `phonepe_${merchantTransactionId}_${providerTxnId || 'na'}`;

//   console.log('processing transaction:', merchantTransactionId, 'eventId:', eventId);

//   const existing = await Event.findOne({ eventId });
//   if (existing && existing.status === 'PROCESSED') {
//     console.log('Event already processed for', eventId);
//     return res.status(200).json({ status: 'ok', message: 'already processed' });
//   }

//   const event = existing || await Event.create({ source: 'phonepe', eventId, payload: data, status: 'PENDING' });

//   try {
//     const payment = await Payment.findOne({ paymentId: merchantTransactionId });
//     if (!payment) {
//       event.status = 'FAILED';
//       event.error = 'payment_not_found';
//       await event.save();
//       console.error('Payment not found for', merchantTransactionId);
//       return res.status(200).json({ status: 'ok', message: 'payment not found' });
//     }

//     console.log('Found Payment:', payment._id, 'current status:', payment.status);

//     const code = data.responseCode || data.statusCode || data.code || '';
//     const state = (data.state || data.status || data.responseCode || '').toString().toUpperCase();

//     let newStatus = 'PENDING';
//     if (code === 'PAYMENT_SUCCESS' || state === 'COMPLETED') newStatus = 'SUCCESS';
//     else if (
//       code === 'PAYMENT_ERROR' ||
//       code === 'PAYMENT_DECLINED' ||
//       code === 'PAYMENT_CANCELLED' ||
//       code === 'BAD_REQUEST' ||
//       code === 'AUTHORIZATION_FAILED' ||
//       state === 'FAILED'
//     ) newStatus = 'FAILED';
//     else if (code === 'PAYMENT_PENDING' || state === 'PENDING') newStatus = 'PENDING';

//     console.log('Interpreted newStatus:', newStatus);

//     payment.status = newStatus;
//     payment.providerTransactionId = providerTxnId || payment.providerTransactionId;
//     payment.response = data;
//     await payment.save();

//     console.log('Updated Payment status to', payment.status);

//     const order = await Order.findById(payment.order);
//     if (!order) {
//       event.status = 'FAILED';
//       event.error = 'order_not_found';
//       await event.save();
//       console.error('Order not found for payment', payment._id);
//       return res.status(200).json({ status: 'ok', message: 'order not found' });
//     }

//     console.log('Found Order:', order._id, 'current status:', order.orderStatus);

//     if (newStatus === 'SUCCESS') {
//       order.orderStatus = 'CONFIRMED';
//       order.payment = order.payment || {};
//       order.payment.paymentId = payment.paymentId;
//       order.payment.status = 'CAPTURED';
//       order.payment.amount = payment.amount;
//       order.payment.currency = payment.currency;
//       order.payment.capturedAt = new Date();
//       order.payment.response = data;
//       order.lastStatusUpdateDt = new Date();
//       await order.save();

//       console.log("Order Confirmed", order._id);

//       // ✅ CloudStore update temporarily disabled
//       /*
//       if (order.cloudstore && order.cloudstore.id && process.env.CLOUDSTORE_SHOP_TOKEN) {
//         try {
//           await cloudstoreService.updateOrder(order.cloudstore.id, {
//             order_status: 'CONFIRMED',
//             last_status_update_dt: { $date: new Date().toISOString() },
//           });
//         } catch (err) {
//           console.error('CloudStore confirm failed:', err.message || err);
//         }
//       }
//       */

//     } else if (newStatus === 'FAILED') {
//       order.orderStatus = 'CANCELED';
//       order.payment = order.payment || {};
//       order.payment.paymentId = payment.paymentId;
//       order.payment.status = 'FAILED';
//       order.payment.response = data;
//       order.lastStatusUpdateDt = new Date();
//       await order.save();

//       console.log("Order Canceled", order._id);

//       // ✅ CloudStore cancel temporarily disabled
//       /*
//       if (order.cloudstore && order.cloudstore.id && process.env.CLOUDSTORE_SHOP_TOKEN) {
//         try {
//           await cloudstoreService.updateOrder(order.cloudstore.id, {
//             order_status: 'CANCELED',
//             last_status_update_dt: { $date: new Date().toISOString() },
//           });
//         } catch (err) {
//           console.error('CloudStore cancel failed:', err.message || err);
//         }
//       }
//       */

//     } else {
//       order.payment = order.payment || {};
//       order.payment.response = data;
//       order.payment.status = 'PENDING';
//       order.lastStatusUpdateDt = new Date();
//       await order.save();
//       console.log('Order remains same', order._id);
//     }

//     event.status = 'PROCESSED';
//     event.processedAt = new Date();
//     await event.save();

//     console.log("Webhook processed successfully");
//     return res.status(200).json({ status: 'ok', message: 'processed' });
//   } catch (err) {
//     console.error('Webhook processing error:', err);
//     event.status = 'FAILED';
//     event.error = err.message || String(err);
//     await event.save();
//     return res.status(500).json({ status: 'error' });
//   }
// });

// exports.handlePaymentRedirect = catchAsync(async (req, res) => {
//   const { paymentId } = req.params;

//   console.log('=Payment Redirect=');
//   console.log('📨 Request details:', {
//     paymentId: req.params.paymentId,
//     fullUrl: req.originalUrl,
//     method: req.method,
//     query: req.query,
//     headers: req.headers
//   });

//   try {
//     const statusResp = await phonepeService.checkPaymentStatus(paymentId);
//     console.log('PhonePe status response:', JSON.stringify(statusResp, null, 2));

//     const payment = await Payment.findOne({ paymentId });
//     if (!payment) {
//       return res.redirect(`/payment/failure?reason=payment_not_found`);
//     }

//     if (payment.status === 'INITIATED' && statusResp.success && statusResp.data) {
//       const data = statusResp.data;
//       const code = data.code || data.responseCode || '';

//       let newStatus = 'PENDING';
//       if (code === 'PAYMENT_SUCCESS') newStatus = 'SUCCESS';
//       else if (['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'PAYMENT_CANCELLED', 'BAD_REQUEST', 'AUTHORIZATION_FAILED'].includes(code)) newStatus = 'FAILED';

//       payment.status = newStatus;
//       payment.providerTransactionId = data.transactionId || data.txnId;
//       payment.response = data;
//       await payment.save();

//       const order = await Order.findById(payment.order);
//       if (order) {
//         if (newStatus === 'SUCCESS') {
//           order.orderStatus = 'CONFIRMED';
//           order.payment.status = 'CAPTURED';
//         } else if (newStatus === 'FAILED') {
//           order.orderStatus = 'CANCELED';
//           order.payment.status = 'FAILED';
//         }
//         order.payment.response = data;
//         order.lastStatusUpdateDt = new Date();
//         await order.save();
//       }
//     }

//     if (payment.status === 'SUCCESS') {
//       return res.redirect(`/payment/success?paymentId=${paymentId}`);
//     } else if (payment.status === 'FAILED') {
//       return res.redirect(`/payment/failure?paymentId=${paymentId}`);
//     } else {
//       return res.redirect(`/payment/failure?paymentId=${paymentId}`);
//     }
//   } catch (error) {
//     console.error('Payment redirect handling error:', error);
//     return res.redirect(`/payment/failure?paymentId=${paymentId}`);
//   }
// });


const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Event = require('../models/Event');
const phonepeService = require('../services/phonepe.service');
const catchAsync = require('../utils/catchAsync');

exports.phonepeWebhook = catchAsync(async (req, res) => {
  console.log('📩 PhonePe webhook received');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  const base64Response = req.body.response || req.body.request;
  const xVerify = req.headers['x-verify'];

  if (!base64Response) {
    console.error('❌ Missing base64 response field');
    return res.status(400).json({ status: 'error', message: 'Missing base64 response field' });
  }

  if (!xVerify) {
    console.error('❌ Missing X-VERIFY header');
    return res.status(400).json({ status: 'error', message: 'Missing X-VERIFY header' });
  }

  // ✅ Verify signature
  const isValid = phonepeService.verifyWebhookSignature(base64Response, xVerify);
  if (!isValid) {
    console.error('❌ Invalid PhonePe signature');
    return res.status(401).json({ status: 'error', message: 'Invalid signature' });
  }

  // ✅ Decode payload
  let payload;
  try {
    payload = phonepeService.parseWebhookPayload(base64Response);
    console.log('✅ Parsed webhook payload:', JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('❌ Invalid webhook payload:', err.message);
    return res.status(400).json({ status: 'error', message: 'Invalid payload' });
  }

  const data = payload?.data || payload;
  const merchantTransactionId = data.merchantTransactionId || data.merchantTxnId;
  const providerTxnId = data.transactionId || data.txnId;
  const eventId = `phonepe_${merchantTransactionId}_${providerTxnId || 'na'}`;

  console.log('Processing transaction:', merchantTransactionId);

  // ✅ Avoid duplicate processing
  const existing = await Event.findOne({ eventId });
  if (existing && existing.status === 'PROCESSED') {
    console.log('⚠️ Event already processed for', eventId);
    return res.status(200).json({ status: 'ok', message: 'already processed' });
  }

  const event = existing || await Event.create({
    source: 'phonepe',
    eventId,
    payload: data,
    status: 'PENDING',
  });

  try {
    const payment = await Payment.findOne({ paymentId: merchantTransactionId });
    if (!payment) {
      event.status = 'FAILED';
      event.error = 'payment_not_found';
      await event.save();
      console.error('❌ Payment not found for', merchantTransactionId);
      return res.status(200).json({ status: 'ok', message: 'payment not found' });
    }

    console.log('✅ Found Payment:', payment._id, 'status:', payment.status);

    const code = data.code || data.responseCode || '';
    const state = (data.state || '').toUpperCase();

    let newStatus = 'PENDING';
    if (code === 'PAYMENT_SUCCESS' || state === 'COMPLETED') newStatus = 'SUCCESS';
    else if (['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'PAYMENT_CANCELLED', 'BAD_REQUEST', 'AUTHORIZATION_FAILED'].includes(code) || state === 'FAILED')
      newStatus = 'FAILED';

    console.log('➡️ Interpreted payment status:', newStatus);

    payment.status = newStatus;
    payment.providerTransactionId = providerTxnId || payment.providerTransactionId;
    payment.response = data;
    await payment.save();

    console.log('💾 Payment updated →', payment.status);

    // ✅ Update Order accordingly
    const order = await Order.findById(payment.order);
    if (!order) {
      event.status = 'FAILED';
      event.error = 'order_not_found';
      await event.save();
      console.error('❌ Order not found for payment', payment._id);
      return res.status(200).json({ status: 'ok', message: 'order not found' });
    }

    console.log('✅ Found Order:', order._id, 'current status:', order.orderStatus);

    if (newStatus === 'SUCCESS') {
      order.orderStatus = 'CONFIRMED';
      order.payment = {
        paymentId: payment.paymentId,
        status: 'CAPTURED',
        amount: payment.amount,
        currency: payment.currency,
        response: data,
        capturedAt: new Date(),
      };
    } else if (newStatus === 'FAILED') {
      order.orderStatus = 'CANCELED';
      order.payment = {
        paymentId: payment.paymentId,
        status: 'FAILED',
        response: data,
      };
    } else {
      order.payment = {
        paymentId: payment.paymentId,
        status: 'PENDING',
        response: data,
      };
    }

    order.lastStatusUpdateDt = new Date();
    await order.save();

    console.log(`✅ Order updated → ${order.orderStatus}`);

    event.status = 'PROCESSED';
    event.processedAt = new Date();
    await event.save();

    console.log('✅ Webhook processing completed successfully');
    return res.status(200).json({ status: 'ok', message: 'processed' });
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
    event.status = 'FAILED';
    event.error = err.message || String(err);
    await event.save();
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


exports.handlePaymentRedirect = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  console.log('=Payment Redirect=');
  console.log('📨 Request details:', {
    paymentId,
    fullUrl: req.originalUrl,
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  try {
    const statusResp = await phonepeService.checkPaymentStatus(paymentId);
    console.log('PhonePe status response:', JSON.stringify(statusResp, null, 2));

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      console.log('❌ Payment not found:', paymentId);
      return res.redirect(`${process.env.FRONTEND_URL}/paymentCheck?paymentId=${paymentId}&status=not_found`);
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      console.log('❌ Order not found for payment:', paymentId);
      return res.redirect(`${process.env.FRONTEND_URL}/paymentCheck?paymentId=${paymentId}&status=order_not_found`);
    }

    let newStatus = payment.status;

    if (statusResp.success && statusResp.data) {
      const data = statusResp.data;
      const code = (data.code || data.responseCode || '').toUpperCase();
      const state = (data.state || '').toUpperCase();

      if (code === 'PAYMENT_SUCCESS' || state === 'COMPLETED') {
        newStatus = 'SUCCESS';
      } else if (
        [
          'PAYMENT_ERROR',
          'PAYMENT_DECLINED',
          'PAYMENT_CANCELLED',
          'BAD_REQUEST',
          'AUTHORIZATION_FAILED',
          'PAYMENT_FAILED',
          'FAILURE',
          'BAD_REQUEST_ERROR',
          'FAILED'
        ].includes(code) ||
        state === 'FAILED'
      ) {
        newStatus = 'FAILED';
      } else if (code === 'PENDING' || state === 'PENDING') {
        newStatus = 'PENDING';
      }

      // Update payment
      payment.status = newStatus;
      payment.providerTransactionId = data.transactionId || data.txnId;
      payment.response = data;
      await payment.save();

      // Update order
      if (newStatus === 'SUCCESS') {
        order.orderStatus = 'CONFIRMED';
        order.payment.status = 'CAPTURED';
      } else if (newStatus === 'FAILED') {
        order.orderStatus = 'CANCELED';
        order.payment.status = 'FAILED';
      } else {
        order.payment.status = 'PENDING';
      }

      order.payment.response = data;
      order.lastStatusUpdateDt = new Date();
      await order.save();
    }

    // Build final redirect URL
    const queryParams = new URLSearchParams({
      paymentId: paymentId,
      orderId: order._id.toString(),
      status: newStatus,
      orderStatus: order.orderStatus
    });

    const redirectUrl = `${process.env.FRONTEND_URL}/paymentCheck?${queryParams.toString()}`;
    console.log('📤 Redirecting to:', redirectUrl);

    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Payment redirect handling error:', error.message);
  
    const errorParams = new URLSearchParams({
      paymentId: paymentId,
      error: 'server_error'
    });

    return res.redirect(`${process.env.FRONTEND_URL}/paymentCheck?${errorParams.toString()}`);
  }
});

