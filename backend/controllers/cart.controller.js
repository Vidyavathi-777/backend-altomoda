const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.createOrUpdateCart = catchAsync(async (req, res) => {
  const { cartId, items } = req.body;
  const userId = req.user?._id;
  const sessionId = req.sessionID || req.headers['x-session-id'];

  const enrichedItems = [];

  for (const item of items) {
    const product = await Product.findOne({ sku: item.sku }).lean();
    if (!product) throw new ApiError(404, `Product ${item.sku} not found`);
    if (product.qty < item.qty) throw new ApiError(400, `Insufficient stock for ${item.sku}`);

    enrichedItems.push({
      sku: item.sku,
      qty: item.qty,
      addedAt: new Date(),
      priceSnapshot: product.stock_price,
    });
  }

  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId);
    if (!cart) throw new ApiError(404, 'Cart not found');
    cart.items = enrichedItems;
    cart.updatedAt = new Date();
  } else {
    const cartData = {
      items: enrichedItems,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ...(userId ? { userId } : { sessionId }),
    };
    cart = await Cart.create(cartData);
  }

  await cart.save();

  const totals = {
    subtotal: enrichedItems.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0),
    itemCount: enrichedItems.reduce((sum, i) => sum + i.qty, 0),
  };

  res.json({
    status: 'success',
    data: {
      cartId: cart._id,
      items: cart.items,
      totals,
    },
  });
});

exports.getCart = catchAsync(async (req, res) => {
  const { cartId } = req.params;
  const cart = await Cart.findById(cartId);
  if (!cart) throw new ApiError(404, 'Cart not found');

  const enrichedItems = [];

  for (const item of cart.items) {
    const product = await Product.findOne({ sku: item.sku }).lean();
    if (product) {
      enrichedItems.push({
        sku: item.sku,
        qty: item.qty,
        addedAt: item.addedAt,
        priceSnapshot: item.priceSnapshot,
        product: {
          title: product.locs?.singles?.title?.en || 'Untitled Product',
          image: product.imgs?.[0]?.url || null,
          currentPrice: product.stock_price,
          availableQty: product.qty,
        },
      });
    }
  }

  const totals = {
    subtotal: enrichedItems.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0),
    itemCount: enrichedItems.reduce((sum, i) => sum + i.qty, 0),
  };

  res.json({
    status: 'success',
    data: {
      cartId: cart._id,
      items: enrichedItems,
      totals,
    },
  });
});