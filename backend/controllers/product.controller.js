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




exports.getAllProducts = catchAsync( async (req, res) => {
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
});

exports.getCategoryTree = catchAsync (async (req, res) => {
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
});

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


exports.getCategoryLevelsById = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // 1️⃣ Fetch all categories (only needed fields)
    const allCategories = await Category.find()
      .select("_id name.locs parent_id children")
      .lean();

    // 2️⃣ Create a map for quick lookup
    const categoryMap = new Map();
    allCategories.forEach((cat) => categoryMap.set(cat._id.toString(), cat));

    // 3️⃣ Recursive helper (build from local data, no DB calls)
    const buildHierarchy = (categoryId) => {
      const category = categoryMap.get(categoryId.toString());
      if (!category) return null;

      return {
        _id: category._id,
        name: category.name?.locs?.en || "",
        children: (category.children || [])
          .map((childId) => buildHierarchy(childId))
          .filter(Boolean),
      };
    };

    // 4️⃣ Build hierarchy starting from the given category
    const hierarchy = buildHierarchy(id);

    if (!hierarchy) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    console.error("Error fetching category levels:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper function to get all category IDs including children
const getAllCategoryIds = (category) => {
  let ids = [category._id.toString()];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids = ids.concat(getAllCategoryIds(child));
    });
  }
  return ids;
};

// Helper function to create standardized product structure
const createStandardizedProduct = (product) => {
  return {
    _id: product._id,
    sku_parent: product.props.sku_parent,
    title: product.locs?.singles?.title || {},
    description: product.locs?.singles?.desc || {},
    color: product.locs?.singles?.color || {},
    brand: product.props.brand,
    season: product.props.season,
    category: product.cats?.[0]?.name?.locs || {},
    cats: product.cats ? product.cats.map(cat => ({
      _id: cat._id,
      name: cat.name?.locs || {}
    })) : [],
    categoryIds: product.cats ? product.cats.map(cat => cat._id) : [],
    composition: product.composition || [],
    care: product.locs?.singles?.care || {},
    made: product.locs?.singles?.made || {},
    fastening: product.locs?.singles?.fastening || {},
    sex: product.locs?.singles?.sex || {},
    images: product.imgs || [],
    base_price: product.stock_price,
    base_buy_price: product.props.buy_price,
    variants: []
  };
};

// Helper function to create standardized variant structure

const createStandardizedVariant = (product) => {
  return {
    _id: product._id,
    sku: product.sku,
    size: product.props.size,
    size_conversion: product.locs?.singles?.size_conversion || {},
    stock: product.qty,
    price: product.stock_price,
    buy_price: product.props.buy_price,
    barcode: product.props.barcode,
    model_measurements: {
      waist: product.props.model_size_waistline,
      hip: product.props.model_size_hip,
      chest: product.props.model_size_chest,
      height: product.props.model_size_height
    }
  };
};

// product.controller.js - Update the sorting logic for newest products

// Helper function to build sort configuration
// In product.controller.js - update buildSortConfig
const buildSortConfig = (sortBy) => {
  switch (sortBy) {
    case 'newest': return { createdAt: -1 };
    case 'price-low': return { 'props.buy_price': 1 };
    case 'price-high': return { 'props.buy_price': -1 };
    case 'a-z': return { 'locs.singles.title.en': 1 };
    case 'z-a': return { 'locs.singles.title.en': -1 };
    case '':
    case 'default':
    default: return { _id: -1 }; // fallback to natural database order
  }
};

// Helper function to get date for newest products (3 days ago)
const getNewestProductsDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 3); // 3 days ago
  return date;
};

// Update getProductsByCategory method with newest filter
exports.getProductsByCategory = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : '';


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Fetch category hierarchy
    const categoryHierarchy = await Category.findById(id).populate({
      path: "children",
      populate: { path: "children", populate: { path: "children" } },
    }).lean();

    if (!categoryHierarchy) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get all category IDs including children
    const categoryIds = getAllCategoryIds(categoryHierarchy);

    // Base query - only products with images
    const baseQuery = { 
      cats: { $in: categoryIds },
      imgs: { $exists: true, $ne: [], $not: { $size: 0 } }
    };

    // For newest sorting, filter products from last 3 days
    if (sortBy === 'newest') {
      baseQuery.createdAt = { $gte: getNewestProductsDate() };
    }

    // Count distinct sku_parent values for accurate pagination
    const distinctSkuParents = await Product.distinct('props.sku_parent', baseQuery);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // Get paginated sku_parents
    const paginatedSkuParents = distinctSkuParents.slice((page - 1) * limit, page * limit);

    // Fetch products belonging to paginated sku_parents with sorting
    const products = await Product.find({
      ...baseQuery,
      'props.sku_parent': { $in: paginatedSkuParents }
    })
      .populate("cats", "name locs")
      .sort(buildSortConfig(sortBy))
      .lean();

    // Group products by sku_parent
    const grouped = {};
    
    products.forEach((product) => {
      const skuParent = product.props.sku_parent;
      
      if (!grouped[skuParent]) {
        grouped[skuParent] = createStandardizedProduct(product);
      }

      grouped[skuParent].variants.push(createStandardizedVariant(product));
    });

    // Convert to array and maintain correct pagination order
    const groupedArray = paginatedSkuParents
      .map((skuParent) => grouped[skuParent])
      .filter((item) => item !== undefined);

    // Apply client-side sorting for price and alphabetical sorts
    const sortedArray = applyClientSideSorting(groupedArray, sortBy);

    res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalGroupedProducts,
        totalPages,
        currentPage: page,
        perPage: limit,  
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: {
        products: sortedArray,
      },
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update getProductsByBrand method with newest filter
exports.getProductsByBrand = catchAsync(async (req, res) => {
  try {
    const { categoryId, brand } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : '';


    if (!brand) {
      return res.status(400).json({ message: "Brand query is required" });
    }

    // Build base query with image filter
    const query = { 
      "props.brand": brand,
      imgs: { $exists: true, $ne: [], $not: { $size: 0 } }
    };

    // For newest sorting, filter products from last 3 days
    if (sortBy === 'newest') {
      query.createdAt = { $gte: getNewestProductsDate() };
    }

    // Add category filter if provided
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const categoryHierarchy = await Category.findById(categoryId).populate({
        path: "children",
        populate: { path: "children", populate: { path: "children" } },
      }).lean();

      if (!categoryHierarchy) {
        return res.status(404).json({ message: "Category not found" });
      }

      const categoryIds = getAllCategoryIds(categoryHierarchy);
      query.cats = { $in: categoryIds };
    }

    // Count distinct sku_parent values
    const distinctSkuParents = await Product.distinct('props.sku_parent', query);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // Get paginated sku_parents
    const paginatedSkuParents = distinctSkuParents.slice((page - 1) * limit, page * limit);

    // Fetch products with sorting
    const products = await Product.find({
      ...query,
      'props.sku_parent': { $in: paginatedSkuParents }
    })
      .populate('cats', 'name locs')
      .sort(buildSortConfig(sortBy))
      .lean();

    // Group products by sku_parent
    const grouped = {};
    
    products.forEach((product) => {
      const skuParent = product.props.sku_parent;
      
      if (!grouped[skuParent]) {
        grouped[skuParent] = createStandardizedProduct(product);
      }

      grouped[skuParent].variants.push(createStandardizedVariant(product));
    });

    // Convert to array and apply pagination
    const groupedArray = paginatedSkuParents
      .map((skuParent) => grouped[skuParent])
      .filter((item) => item !== undefined);

    // Apply client-side sorting
    const sortedArray = applyClientSideSorting(groupedArray, sortBy);

    res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalGroupedProducts,
        totalPages,
        currentPage: page,
        perPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: {
        products: sortedArray,
      },
    });

  } catch (error) {
    console.error("Error fetching products by brand:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update getProductsWithFilters method with newest filter
exports.getProductsWithFilters = catchAsync(async (req, res) => {
  try {
    const { categoryIds, brands, colors, isNewArrival, days, sortBy = '' } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filter = {
      imgs: { $exists: true, $ne: [], $not: { $size: 0 } }
    };

    // For newest sorting, filter products from last 3 days
    if (sortBy === 'newest' && !isNewArrival) {
      filter.createdAt = { $gte: getNewestProductsDate() };
    }

    // Add new arrivals filter if specified (overrides newest filter)
    if (isNewArrival) {
      const daysFilter = parseInt(days) || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysFilter);
      filter.createdAt = { $gte: startDate };
    }

    // Handle multiple categories
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      let allCategoryIds = [];

      for (let id of categoryIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) continue;

        const categoryHierarchy = await Category.findById(id).populate({
          path: "children",
          populate: { path: "children", populate: { path: "children" } },
        }).lean();

        if (categoryHierarchy) {
          allCategoryIds = allCategoryIds.concat(getAllCategoryIds(categoryHierarchy));
        }
      }

      if (allCategoryIds.length > 0) {
        filter.cats = { $in: allCategoryIds };
      }
    }

    // Brand filter (multiple brands)
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filter["props.brand"] = { $in: brands };
    }

    // Color filter (multiple colors)
    if (colors && Array.isArray(colors) && colors.length > 0) {
      filter["locs.singles.color.en"] = { $in: colors };
    }

    // Count distinct sku_parent for correct pagination
    const distinctSkuParents = await Product.distinct("props.sku_parent", filter);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // Get paginated sku_parents
    const paginatedSkuParents = distinctSkuParents.slice((page - 1) * limit, page * limit);

    // Fetch products belonging to paginated sku_parents with sorting
    const paginatedFilter = {
      ...filter,
      "props.sku_parent": { $in: paginatedSkuParents },
    };

    const products = await Product.find(paginatedFilter)
      .sort(buildSortConfig(sortBy))
      .populate("cats", "name locs")
      .lean();

    // Group by sku_parent
    const grouped = {};

    products.forEach((product) => {
      const skuParent = product.props.sku_parent;

      if (!grouped[skuParent]) {
        grouped[skuParent] = {
          ...createStandardizedProduct(product),
          createdAt: product.createdAt,
        };
      }

      grouped[skuParent].variants.push(createStandardizedVariant(product));
    });

    // Convert to array and maintain correct pagination order
    const groupedArray = paginatedSkuParents
      .map((skuParent) => grouped[skuParent])
      .filter((item) => item !== undefined);

    // Apply client-side sorting
    const sortedArray = applyClientSideSorting(groupedArray, sortBy);

    res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalGroupedProducts,
        totalPages,
        currentPage: page,
        perPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: {
        products: sortedArray,
      },
    });
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update getNewProducts method - keep original new arrivals logic
exports.getNewProducts = catchAsync(async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 7;
    const sortBy = req.query.sortBy || 'newest';

    // Validate compulsory category ID
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required in URL parameters",
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let filter = {
      imgs: { $exists: true, $ne: [], $not: { $size: 0 } },
      createdAt: {$gte: startDate}
    };

    // Handle category hierarchy
    const categoryHierarchy = await Category.findById(categoryId).populate({
      path: "children",
      populate: { path: "children", populate: { path: "children" } },
    }).lean();

    if (!categoryHierarchy) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const allCategoryIds = getAllCategoryIds(categoryHierarchy);

    if (allCategoryIds.length > 0) {
      filter.cats = { $in: allCategoryIds };
    }

    // Count distinct sku_parent for correct pagination
    const distinctSkuParents = await Product.distinct("props.sku_parent", filter);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // Get paginated sku_parents
    const paginatedSkuParents = distinctSkuParents.slice((page - 1) * limit, page * limit);

    if (paginatedSkuParents.length === 0) {
      return res.status(200).json({
        success: true,
        pagination: {
          totalProducts: totalGroupedProducts,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: {
          products: [],
        },
      });
    }

    // Fetch products belonging to paginated sku_parents with sorting
    const paginatedFilter = {
      ...filter,
      "props.sku_parent": { $in: paginatedSkuParents },
    };

    const products = await Product.find(paginatedFilter)
      .sort(buildSortConfig(sortBy))
      .populate("cats", "name locs")
      .lean();

    // Group by sku_parent
    const grouped = {};

    products.forEach((product) => {
      const skuParent = product.props?.sku_parent || "unknown";

      if (!grouped[skuParent]) {
        const firstProductInGroup = products.find(p => p.props?.sku_parent === skuParent);
        
        grouped[skuParent] = {
          ...createStandardizedProduct(product),
          createdAt: firstProductInGroup?.createdAt || product.createdAt,
        };
      }

      grouped[skuParent].variants.push({
        ...createStandardizedVariant(product),
        variantCreatedAt: product.createdAt,
      });
    });

    // Convert to array and maintain correct pagination order
    const groupedArray = paginatedSkuParents
      .map((skuParent) => grouped[skuParent])
      .filter((item) => item !== undefined);

    // Apply client-side sorting
    const sortedArray = applyClientSideSorting(groupedArray, sortBy);

    res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalGroupedProducts,
        totalPages,
        currentPage: page,
        perPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: {
        products: sortedArray,
      },
    });
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching new products",
    });
  }
});

// Client-side sorting helper function
const applyClientSideSorting = (products, sortBy) => {
  const sorted = [...products];
  
  switch(sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a.minPrice || a.base_price || 0) - (b.minPrice || b.base_price || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b.minPrice || b.base_price || 0) - (a.minPrice || a.base_price || 0));
    case 'a-z':
      return sorted.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
    case 'z-a':
      return sorted.sort((a, b) => (b.productName || '').localeCompare(a.productName || ''));
    case 'newest':
    default:
      // Already sorted by createdAt from database, just return as is
      return sorted;
  }
};

// Get product by SKU parent
exports.getProductBySkuParent = catchAsync(async (req, res) => {
  const { sku } = req.params;

  if (!sku || typeof sku !== "string") {
    throw new ApiError(400, "Invalid SKU format");
  }

  // Find all products with this sku_parent
  const products = await Product.find({ "props.sku_parent": sku })
    .populate("cats", "name locs")
    .lean();

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found for this parent SKU");
  }

  const baseProduct = products[0];
  const groupedProduct = createStandardizedProduct(baseProduct);

  // Add all variants
  products.forEach((product) => {
    groupedProduct.variants.push(createStandardizedVariant(product));
  });

  res.status(200).json({
    success: true,
    data: groupedProduct,
  });
});

// Get related products
exports.getRelatedProducts = catchAsync(async (req, res) => {
  try {
    const { sku } = req.params;

    // Find main product to get category
    const mainProduct = await Product.findOne({ 
      "props.sku_parent": sku,
      imgs: { $exists: true, $ne: [], $not: { $size: 0 } }
    }).populate("cats");

    if (!mainProduct) {
      throw new ApiError(404, 'Product Not Found');
    }

    const categoryId = mainProduct.cats[0]?._id;
    if (!categoryId) {
      throw new ApiError(400, "Category not found for this product");
    }

    // Get category hierarchy
    const categoryHierarchy = await Category.findById(categoryId)
      .populate({
        path: "children",
        populate: { path: "children", populate: { path: "children" } },
      })
      .lean();

    if (!categoryHierarchy) {
      return res.status(404).json({ message: "Category not found" });
    }

    const categoryIds = getAllCategoryIds(categoryHierarchy);

    // Fetch related products, excluding current product
    const products = await Product.find({
      cats: { $in: categoryIds },
      "props.sku_parent": { $ne: sku },
      imgs: { $exists: true, $ne: [], $not: { $size: 0 } }
    })
      .populate("cats", "name locs")
      .limit(100)
      .lean();

    // Group products by sku_parent
    const grouped = {};

    products.forEach((product) => {
      const parent = product.props.sku_parent;

      if (!grouped[parent]) {
        grouped[parent] = createStandardizedProduct(product);
      }

      grouped[parent].variants.push(createStandardizedVariant(product));
    });

    // Convert to array and limit to 20 products
    const groupedArray = Object.values(grouped).slice(0, 20);

    res.status(200).json({
      success: true,
      data: {
        products: groupedArray,
      },
    });

  } catch (error) {
    console.error("Error fetching related products:", error);
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching related products",
    });
  }
});



module.exports = exports;