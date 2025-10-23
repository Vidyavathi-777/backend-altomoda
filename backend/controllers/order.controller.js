// controllers/order.controller.js
const Order = require('../models/Order');
const cloudstoreService = require('../services/cloudstore.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.createOrder = catchAsync(async (req, res) => {
  const body = req.body;

  const totQty = (body.items || []).reduce((s, it) => s + (it.quantity || 0), 0);
  const totAmount = (body.items || []).reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0);

  const order = await Order.create({
    shopOrderId: body.shopOrderId || `od_${Date.now()}`,
    user: req.user._id,
    items: body.items || [],
    totQty: body.totQty || totQty,
    totAmount: body.totAmount || totAmount,
    buyerEmail: body.buyerEmail || req.user.email,
    buyerName: body.buyerName || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
    shippingInfo: body.shippingInfo,
    billingInfo: body.billingInfo,
    additionalInfo: body.additionalInfo,
    orderDt: body.orderDt || new Date(),
    orderStatus: 'PENDING',
    lastStatusUpdateDt: new Date(),
  });

  // Build CloudStore order payload loosely per docs (send only required fields)
  if (process.env.CLOUDSTORE_SHOP_TOKEN) {
    try {
      const csPayload = {
        shop_order_id: order.shopOrderId,
        order_status: 'PENDING',
        order_dt: { $date: new Date().toISOString() },
        buyer_email: order.buyerEmail,
        buyer_name: order.buyerName,
        items: (order.items || []).map(it => ({
          sku: it.sku,
          qty: it.quantity,
          price: it.price,
        })),
        tot_qty: order.totQty,
        tot_amount: order.totAmount,
        additional_info: order.additionalInfo || {},
      };

      const csResp = await cloudstoreService.createOrder(csPayload);
      // CloudStore returns created order; save id if present
      const cloudstoreId = csResp && (csResp._id || csResp.id || csResp.shop_order_id);
      order.cloudstore = order.cloudstore || {};
      order.cloudstore.id = cloudstoreId || order.cloudstore.id;
      order.cloudstore.lastResponse = csResp;
      await order.save();
    } catch (err) {
      // don't fail the order creation if CloudStore is unavailable — just log and proceed
      console.error('CloudStore order create failed:', err.message || err);
    }
  }

  res.status(201).json({ success: true, data: order });
});

exports.getOrders = catchAsync(async (req, res) => {
  const query = req.admin ? {} : { user: req.user._id };
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

exports.getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const allowed = ['PENDING','CONFIRMED','CANCELED','PARTIALLY_SHIPPED','SHIPPED','DELIVERED'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid status');

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.orderStatus = status;
  order.lastStatusUpdateDt = new Date();
  await order.save();

  // Mirror to CloudStore if we have cloudstore id
  if (order.cloudstore && order.cloudstore.id && process.env.CLOUDSTORE_SHOP_TOKEN) {
    try {
      await cloudstoreService.updateOrder(order.cloudstore.id, { order_status: status, last_status_update_dt: { $date: new Date().toISOString() } });
    } catch (err) {
      console.error('CloudStore update failed:', err.message || err);
    }
  }

  res.json({ success: true, data: order });
});
