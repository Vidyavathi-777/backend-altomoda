const Cart = require('../models/Cart');
const Product = require('../models/Product'); 
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

exports.addToCart = catchAsync(async (req, res, next) => {
  const { userId, sku, qty, priceSnapshot } = req.body;

  if (!userId || !sku || !qty || !priceSnapshot) {
    throw new ApiError(400, 'Please provide userId, sku, qty, and priceSnapshot');
  }

  if (qty <= 0) {
    throw new ApiError(400, 'Quantity must be greater than 0');
  }

  const cartExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Find cart by userId
  let cart = await Cart.findOne({ userId });

  if (cart) {
    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.sku === sku);

    if (existingItem) {
      // Update quantity of existing item
      existingItem.qty += qty;
      existingItem.priceSnapshot = priceSnapshot; // Update to latest price
      existingItem.addedAt = new Date();
    } else {
      // Add new item to cart
      cart.items.push({
        sku,
        qty,
        priceSnapshot,
        addedAt: new Date()
      });
    }

    cart.expiresAt = cartExpiry;
    await cart.save();
  } else {
    // Create new cart
    cart = await Cart.create({
      userId,
      items: [{
        sku,
        qty,
        priceSnapshot,
        addedAt: new Date()
      }],
      expiresAt: cartExpiry
    });
  }

  // Calculate cart summary
  const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.qty * item.priceSnapshot), 0);

  res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      totalItems,
      subtotal
    }
  });
});


exports.getCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'Please provide userId');
  }

  const cart = await Cart.findOne({ userId });  

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0
      }
    });
  }

  const skus = cart.items.map(item => item.sku);
  const products = await Product.find({ sku: { $in: skus } }).lean();
    const enrichedItems = cart.items.map(item => {
    const product = products.find(p => p.sku === item.sku);
    return {
      _id: item._id,
      sku: item.sku,
      qty: item.qty,
      priceSnapshot: item.priceSnapshot,
      addedAt: item.addedAt,
      product: product ? {
        title: product.locs?.singles?.title?.en || 'Product',
        brand: product.props?.brand || 'Brand',
        image: product.imgs?.[0]?.url || '',
        size: product.props?.size || 'N/A',
        color: product.locs?.singles?.color?.en || ''
      } : null
    };
  });


  // Calculate cart summary
  const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.qty * item.priceSnapshot), 0);

  res.status(200).json({
    success: true,
    data: {
      _id: cart._id,
      userId: cart.userId,
      items: enrichedItems,
      totalItems,
      subtotal,
      expiresAt: cart.expiresAt
    }
  });
});


exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { sku } = req.params;
  const { userId, qty } = req.body;

  if (!userId || !qty) {
    throw new ApiError(400, 'Please provide userId and qty');
  }

  if (qty <= 0) {
    throw new ApiError(400, 'Quantity must be greater than 0');
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.find(item => item.sku === sku);

  if (!item) {
    throw new ApiError(404, 'Item not found in cart');
  }

  // Update quantity
  item.qty = qty;
  item.addedAt = new Date();

  await cart.save();

  // Calculate cart summary
  const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.qty * item.priceSnapshot), 0);

  res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      totalItems,
      subtotal
    }
  });
});


exports.removeCartItem = catchAsync(async (req, res, next) => {
  const { sku } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, 'Please provide userId');
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item.sku === sku);

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  // Remove item from cart
  cart.items.splice(itemIndex, 1);

  // If cart is empty, delete it
  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Cart cleared'
    });
  }

  await cart.save();

  // Calculate cart summary
  const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.qty * item.priceSnapshot), 0);

  res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      totalItems,
      subtotal
    }
  });
});


exports.clearCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'Please provide userId');
  }

  const cart = await Cart.findOneAndDelete({ userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  res.status(200).json({
    success: true,
    data: null,
    message: 'Cart cleared successfully'
  });
});