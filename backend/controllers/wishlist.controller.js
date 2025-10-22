const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

exports.getWishlist = catchAsync(async (req, res) => {
  let wishlist = await Wishlist.findOne({ userId: req.user._id });

  if (!wishlist) wishlist = await Wishlist.create({ userId: req.user._id, items: [] });

  const enrichedItems = [];

  for (const item of wishlist.items) {
    const product = await Product.findOne({ sku: item.sku }).lean();
    if (product) {
      enrichedItems.push({
        sku: item.sku,
        addedAt: item.addedAt,
        product: {
          title: product.locs?.singles?.title?.en || 'Untitled Product',
          image: product.imgs?.[0]?.url || null,
          price: product.stock_price,
          available: product.qty > 0,
        },
      });
    }
  }

  res.json({
    status: 'success',
    data: { items: enrichedItems },
  });
});

exports.addToWishlist = catchAsync(async (req, res) => {
  const { sku } = req.body;
  const product = await Product.findOne({ sku });
  if (!product) throw new ApiError(404, 'Product not found');

  let wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId: req.user._id,
      items: [{ sku, addedAt: new Date() }],
    });
  } else {
    if (wishlist.items.some(item => item.sku === sku))
      throw new ApiError(400, 'Product already in wishlist');
    wishlist.items.push({ sku, addedAt: new Date() });
    await wishlist.save();
  }

  res.status(201).json({
    status: 'success',
    message: 'Product added to wishlist',
  });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
  const { sku } = req.params;
  const wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) throw new ApiError(404, 'Wishlist not found');

  wishlist.items = wishlist.items.filter(item => item.sku !== sku);
  await wishlist.save();

  res.json({
    status: 'success',
    message: 'Product removed from wishlist',
  });
});
