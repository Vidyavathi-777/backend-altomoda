const Product = require('../models/Product');
const Category = require('../models/Category');
const searchService = require('../services/search.service');
const cloudstoreService = require('../services/cloudstore.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const mongoose = require("mongoose")

// Get all products with search/filter support
exports.getProducts = catchAsync(async (req, res) => {
  const result = await searchService.searchProducts(req.query);



  const mapped = result.items.map(p => ({
    sku: p.sku,
    title: p.title || 'Untitled',
    price: p.priceCalc?.finalMrpInr,
    qty: p.qty,
    images: p.imgs || [],
    categories: p.categories,
    warehouses: p.warehouses,
    brand: p.brand || null,
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



// Controller: Fetch products by filters (categories, brands, pagination, limit)
exports.getProductsWithFilters = catchAsync(async (req, res) => {
  let {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    categories = [],
    brands = [],
  } = req.body;

  // Convert to proper types
   page = Math.max(parseInt(page) || 1, 1);  // ✅ ensures page >= 1
  limit = Math.max(parseInt(limit) || 20, 1); // ✅ ensures limit >= 1

  const query = {};

  // 🟡 Filter by categories
  if (Array.isArray(categories) && categories.length > 0) {
    query.cats = { $in: categories };
  }

  // 🟢 Filter by brands (inside props.brand)
  if (Array.isArray(brands) && brands.length > 0) {
    query["props.brand"] = { $in: brands };
  }

  // 🧮 Pagination
  const skip = (page - 1) * limit;

  // 🧾 Sorting
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // ⚡ Fetch products
  const [products, totalCount] = await Promise.all([
    Product.find(query)
      .populate("cats", "name") // optional
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    products,
  });
});



exports.getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;



  const product = await Product.findById(id)
    .populate('cats', 'name locs') // populate category info
    .lean();

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    status: 'success',
    data: product,
  });
});

exports.getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const getCategoryTree = async (categoryId) => {
    const category = await Category.findById(categoryId).lean();
    if (!category) return null;

    // Recursively get children
    const children = await Category.find({ parent_id: categoryId }).lean();
    const childrenWithSub = await Promise.all(
      children.map(async (child) => await getCategoryTree(child._id))
    );

    return {
      ...category,
      children: childrenWithSub,
    };
  };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid category ID');
  }

  const categoryTree = await getCategoryTree(id);

  if (!categoryTree) {
    throw new ApiError(404, 'Category not found');
  }

  res.json({
    status: 'success',
    data: categoryTree,
  });
});

exports.getProductsGroupedBySku = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    categories = [],
    brands = [],
    colors = [],
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.body;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (categories.length) {
    query['cats'] = { $in: categories.map(id => mongoose.Types.ObjectId(id)) };
  }

  if (brands.length) {
    query['props.brand'] = { $in: brands.map(b => new RegExp(b, 'i')) };
  }

  if (colors.length) {
    query['locs.singles.color.en'] = { $in: colors.map(c => new RegExp(c, 'i')) };
  }

  if (minPrice || maxPrice) {
    query['stock_price'] = {};
    if (minPrice) query['stock_price'].$gte = parseFloat(minPrice);
    if (maxPrice) query['stock_price'].$lte = parseFloat(maxPrice);
  }

  if (inStock !== undefined) {
    const stockBool = inStock === true || inStock === 'true';
    query['qty'] = stockBool ? { $gt: 0 } : { $lte: 0 };
  }

  const sortConfig = {};
  const sortField = sortBy === 'price' ? 'stock_price' : sortBy;
  sortConfig[sortField] = sortOrder === 'asc' ? 1 : -1;

  const products = await Product.find(query)
    .populate('cats', 'name locs')
    .sort(sortConfig)
    .lean();

  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.sku]) {
      grouped[p.sku] = {
        sku: p.sku,
        title: p.locs?.singles?.title?.en || 'Untitled',
        brand: p.props?.brand || null,
        categories: p.cats,
        variants: [],
      };
    }

    grouped[p.sku].variants.push({
      _id: p._id,
      size: p.props?.size || null,
      color: p.locs?.singles?.color?.en || null,
      price: p.stock_price,
      qty: p.qty,
      images: p.imgs?.map(img => img.url) || [],
      props: p.props,
    });
  });

  const groupedArray = Object.values(grouped);
  const total = groupedArray.length;
  const paginated = groupedArray.slice(skip, skip + limitNum);

  res.json({
    status: 'success',
    data: paginated,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  });
});


exports.getAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 100, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, totalItems] = await Promise.all([
      Product.find()
        .populate('cats', 'name locs')
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments()
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      status: 'success',
      metadata: {
        currentPage: page,
        pageSize: limit,
        totalProducts: totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.getCategoryTree = async (req, res) => {
  function buildCategoryTree(categories, parentId = null) {
    return categories
      .filter(cat => String(cat.parent_id) === String(parentId))
      .map(cat => {
        const children = buildCategoryTree(categories, cat._id);
        return {
          _id: cat._id,
          name: cat.name,
          level: cat.level,
          leaf: cat.leaf,
          children: children,
          custom_categories: cat.custom_categories,
          standard_categories: cat.standard_categories
        };
      });
  }
  try {
    const categories = await Category.find().lean(); // get plain JS objects
    const tree = buildCategoryTree(categories, null);
    res.status(200).json(tree);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getChildCategories = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const childCategories = await Category.find({ parent_id: categoryId })
    .select('name locs level leaf parent_id') // Select required fields
    .lean();

  res.json({
    status: 'success',
    data: childCategories,
  });
});

