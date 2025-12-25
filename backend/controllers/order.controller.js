// controllers/order.controller.js
const Order = require('../models/Order');
// const cloudstoreService = require('../services/cloudstore.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { error } = require('winston');
const Product = require('../models/Product')

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

  // ✅ CloudStore integration temporarily disabled
  /*
  if (process.env.CLOUDSTORE_SHOP_TOKEN) {
    try {
      const orderData = {
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
        tot_amount: {
          currency: 'INR',
          amount: order.totAmount,
        },
        additional_info: order.additionalInfo || {},
        shipping_info: {
          address: {
            street: order.shippingInfo.address,
            city: order.shippingInfo.city,
            state: order.shippingInfo.state,
            zip: order.shippingInfo.pincode,
          },
        },
        billing_info: {
          address: {
            street: order.billingInfo.address,
            city: order.billingInfo.city,
            state: order.billingInfo.state,
            zip: order.billingInfo.pincode,
          },
        },
      };

      console.log('CloudStore Payload:', JSON.stringify({ order: orderData }, null, 2));

      const csResp = await cloudstoreService.createOrder(orderData);
      const cloudstoreId = csResp && (csResp._id || csResp.id || csResp.shop_order_id);
      if (cloudstoreId) {
        order.cloudstore = {
          id: cloudstoreId,
          lastResponse: csResp,
          syncedAt: new Date(),
        };
        await order.save();
        console.log('Order synced to CloudStore:', cloudstoreId);
      } else {
        console.warn('CloudStore order created but no ID returned');
      }

      order.cloudstore = order.cloudstore || {};
      order.cloudstore.id = order.cloudstore.id || cloudstoreId;
      order.cloudstore.lastResponse = csResp;
      await order.save();
    } catch (err) {
      console.error('CloudStore order create failed', {
        error: err.message,
        status: err.statusCode,
        details: err.response?.data,
      });
    }
  }
  */

  
  res.status(201).json({ success: true, data: order });
});


exports.getOrdersByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email');

  if (!orders || orders.length === 0) {
    return res.json({ 
      success: true, 
      count: 0, 
      data: [],
      message: 'No orders found for this user'
    });
  }

  // Enrich orders with product details
  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const orderObj = order.toObject();
      
      // Get product details for each item
      const skus = orderObj.items.map(item => item.sku);
      const products = await Product.find({ sku: { $in: skus } }).lean();
      
      // Enrich items with product details
      orderObj.items = orderObj.items.map(item => {
        const product = products.find(p => p.sku === item.sku);
        return {
          ...item,
          productDetails: product ? {
            title: product.locs?.singles?.title?.en || 'Product',
            brand: product.props?.brand || 'Brand',
            image: product.imgs?.[0]?.url || '',
            size: product.props?.size || 'N/A',
            color: product.locs?.singles?.color?.en || ''
          } : null
        };
      });
      
      return orderObj;
    })
  );

  res.json({ 
    success: true, 
    count: enrichedOrders.length, 
    data: enrichedOrders 
  });
});

exports.getOrders = catchAsync(async (req, res) => {
  const query = req.admin ? {} : { user: req.user._id };
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

exports.getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
  if (!order) throw new ApiError(404, 'Order not found');

  const orderObj = order.toObject();
  
  // Enrich with product details
  const skus = orderObj.items.map(item => item.sku);
  const products = await Product.find({ sku: { $in: skus } }).lean();
  
  orderObj.items = orderObj.items.map(item => {
    const product = products.find(p => p.sku === item.sku);
    return {
      ...item,
      productDetails: product ? {
        title: product.locs?.singles?.title?.en || 'Product',
        brand: product.props?.brand || 'Brand',
        image: product.imgs?.[0]?.url || '',
        size: product.props?.size || 'N/A',
        color: product.locs?.singles?.color?.en || '',
        description: product.locs?.singles?.desc?.en || ''
      } : null
    };
  });
  
  res.json({ success: true, data: orderObj });
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
