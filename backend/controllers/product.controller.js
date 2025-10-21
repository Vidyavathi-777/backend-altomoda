const Product = require('../models/Product');
const Category = require('../models/Category');
const searchService = require('../services/search.service');
const cloudstoreService = require('../services/cloudstore.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');

// Get all products with search/filter support
exports.getProducts = catchAsync(async (req, res) => {
  const result = await searchService.searchProducts(req.query);

  const mapped = result.map(p => ({
    sku: p.sku,
    title: p.locs?.singles?.title?.en || 'Untitled',
    price: p.stock_price,
    qty: p.qty,
    images: p.imgs?.map(img => img.url) || [],
    categories: p.cats,
    warehouses: p.whs,
    brand: p.props?.brand || null,
  }));

  res.json({
    status: 'success',
    data: mapped,
  });
});

// Get single product by SKU
exports.getProduct = catchAsync(async (req, res) => {
  const { sku } = req.params;
  const { refreshStock } = req.query;

  let product = await Product.findOne({ sku })
    .populate('cats')
    .populate('whs')
    .lean();

  if (!product) throw new ApiError(404, 'Product not found');

  // Optionally refresh stock from CloudStore
  if (refreshStock === 'true') {
    try {
      const cloudData = await cloudstoreService.findByCode(sku);
      if (cloudData?.stock) {
        product.qty = cloudData.stock.qty || 0;

        // Update DB
        await Product.updateOne({ sku }, { $set: { qty: product.qty } });
      }
    } catch (error) {
      console.error('Failed to refresh stock:', error);
    }
  }

  res.json({
    status: 'success',
    data: {
      sku: product.sku,
      title: product.locs?.singles?.title?.en || 'Untitled',
      price: product.stock_price,
      qty: product.qty,
      images: product.imgs?.map(img => img.url) || [],
      categories: product.cats,
      warehouses: product.whs,
      brand: product.props?.brand || null,
      props: product.props,
    },
  });
});

// Get product availability (real-time from CloudStore)
exports.getProductAvailability = catchAsync(async (req, res) => {
  const { sku } = req.params;

  const cloudData = await cloudstoreService.findByCode(sku);
  if (!cloudData) throw new ApiError(404, 'Product not found in CloudStore');

  const availableQty = (cloudData.stock?.qty || 0) - (cloudData.stock?.reserved || 0);

  res.json({
    status: 'success',
    data: {
      sku,
      availableQty,
      reservedQty: cloudData.stock?.reserved || 0,
      status: availableQty > 0 ? 'in_stock' : 'out_of_stock',
    },
  });
});

// Get all categories (as a tree)
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find()
    .populate('parentId')
    .sort('order')
    .lean();

  const categoryMap = {};
  const rootCategories = [];

  categories.forEach(cat => {
    categoryMap[cat._id] = { ...cat, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parentId && categoryMap[cat.parentId._id]) {
      categoryMap[cat.parentId._id].children.push(categoryMap[cat._id]);
    } else {
      rootCategories.push(categoryMap[cat._id]);
    }
  });

  res.json({
    status: 'success',
    data: { categories: rootCategories },
  });
});

// Get unique brands from products
exports.getBrands = catchAsync(async (req, res) => {
  const brands = await Product.distinct('props.brand');
  res.json({
    status: 'success',
    data: { brands },
  });
});
