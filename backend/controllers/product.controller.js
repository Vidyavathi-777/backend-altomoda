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
// exports.getProductsWithFilters = catchAsync(async (req, res) => {
//   let {
//     page = 1,
//     limit = 20,
//     sortBy = "createdAt",
//     sortOrder = "desc",
//     categories = [],
//     brands = [],
//   } = req.body;

//   // Convert to proper types
//    page = Math.max(parseInt(page) || 1, 1);  // ✅ ensures page >= 1
//   limit = Math.max(parseInt(limit) || 20, 1); // ✅ ensures limit >= 1

//   const query = {};

//   // 🟡 Filter by categories
//   if (Array.isArray(categories) && categories.length > 0) {
//     query.cats = { $in: categories };
//   }

//   // 🟢 Filter by brands (inside props.brand)
//   if (Array.isArray(brands) && brands.length > 0) {
//     query["props.brand"] = { $in: brands };
//   }

//   // 🧮 Pagination
//   const skip = (page - 1) * limit;

//   // 🧾 Sorting
//   const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

//   // ⚡ Fetch products
//   const [products, totalCount] = await Promise.all([
//     Product.find(query)
//       .populate("cats", "name") // optional
//       .sort(sort)
//       .skip(skip)
//       .limit(limit),
//     Product.countDocuments(query),
//   ]);

//   res.status(200).json({
//     success: true,
//     totalCount,
//     page,
//     totalPages: Math.ceil(totalCount / limit),
//     products,
//   });
// });



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


exports.getCategoryLevelsById = async (req, res) => {
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
};



// Controller: fetch products by category ID with pagination
exports.getProductsByCategory = async (req, res) => {
  const getAllCategoryIds = (category) => {
    let ids = [category._id.toString()];

    if (category.children && category.children.length > 0) {
      category.children.forEach((child) => {
        ids = ids.concat(getAllCategoryIds(child));
      });
    }

    return ids;
  };

  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // 1️⃣ Fetch category hierarchy
    const categoryHierarchy = await Category.findById(id).populate({
      path: "children",
      populate: { path: "children", populate: { path: "children" } },
    }).lean();

    if (!categoryHierarchy) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 2️⃣ Get all category IDs including children
    const categoryIds = getAllCategoryIds(categoryHierarchy);

    // 3️⃣ Fetch products
    const products = await Product.find({ cats: { $in: categoryIds } })
      .populate("cats", "name.locs")
      .skip((page - 1) * limit)
      .limit(limit * 5) // Fetch more to account for grouping
      .lean();

    // 4️⃣ Group products by sku_parent
    const grouped = {};
    
    products.forEach((product) => {
      const skuParent = product.props.sku_parent;
      
      if (!grouped[skuParent]) {
        // Create main product with common data (use the first variant as base)
        grouped[skuParent] = {
          _id: product._id,
          sku_parent: skuParent,
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
          composition: product.composition || [],
          care: product.locs?.singles?.care || {},
          made: product.locs?.singles?.made || {},
          fastening: product.locs?.singles?.fastening || {},
          sex: product.locs?.singles?.sex || {},
          images: product.imgs || [],
          // Use average or first variant's pricing as base
          base_price: product.stock_price,
          base_buy_price: product.props.buy_price,
          variants: []
        };
      }

      // Add variant details
      grouped[skuParent].variants.push({
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
      });
    });

    // 5️⃣ Convert to array and calculate actual pagination
    const groupedArray = Object.values(grouped);
    
    // Get total count for accurate pagination
    const totalProducts = await Product.countDocuments({ 
      cats: { $in: categoryIds } 
    });
    
    // Since we're grouping by sku_parent, we need to count distinct sku_parent values
    const distinctSkuParents = await Product.distinct('props.sku_parent', { 
      cats: { $in: categoryIds } 
    });
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // 6️⃣ Apply pagination to grouped results
    const paginatedResults = groupedArray.slice(0, limit); // We already limited the initial query

    // 7️⃣ Return response
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
        products: paginatedResults
      },
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProductsByBrand = async (req, res) => {
  try {
     const { categoryId } = req.params; 
    const { brand } = req.params;
   // optional category filter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!brand) {
      return res.status(400).json({ message: "Brand query is required" });
    }

    // Build query object
    const query = { "props.brand": brand };

    // Add category filter if provided
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      // Function to get all category IDs including children
      const getAllCategoryIds = (category) => {
        let ids = [category._id.toString()];
        if (category.children && category.children.length > 0) {
          category.children.forEach((child) => {
            ids = ids.concat(getAllCategoryIds(child));
          });
        }
        return ids;
      };

      // Fetch category hierarchy
      const categoryHierarchy = await Category.findById(categoryId).populate({
        path: "children",
        populate: { path: "children", populate: { path: "children" } },
      }).lean();

      if (!categoryHierarchy) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Get all category IDs including children
      const categoryIds = getAllCategoryIds(categoryHierarchy);
      query.cats = { $in: categoryIds };
    }

    // 1️⃣ Count distinct sku_parent values for accurate pagination
    const distinctSkuParents = await Product.distinct('props.sku_parent', query);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // 2️⃣ Fetch products with pagination
    const products = await Product.find(query)
      .populate('cats', 'name locs')
      .skip((page - 1) * limit * 3) // Fetch more to account for grouping
      .limit(limit * 5)
      .lean();

    // 3️⃣ Group products by sku_parent
    const grouped = {};
    
    products.forEach((product) => {
      const skuParent = product.props.sku_parent;
      
      if (!grouped[skuParent]) {
        // Create main product with common data
        grouped[skuParent] = {
          _id: product._id,
          sku_parent: skuParent,
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
      }

      // Add variant details
      grouped[skuParent].variants.push({
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
      });
    });

    // 4️⃣ Convert to array and apply pagination
    const groupedArray = Object.values(grouped);
    const paginatedResults = groupedArray.slice(0, limit);

    // 5️⃣ Send response
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
        products: paginatedResults,
      },
    });

  } catch (error) {
    console.error("Error fetching products by brand:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Controller: fetch products with multiple categories and brands
exports.getProductsWithFilters = async (req, res) => {
  const getAllCategoryIds = (category) => {
  let ids = [category._id.toString()];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids = ids.concat(getAllCategoryIds(child));
    });
  }
  return ids;
};
  try {
    const { categoryIds, brands, colors } = req.body; // note plural categoryIds
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filter = {};

    // 1️⃣ Handle multiple categories
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

    // 2️⃣ Brand filter (multiple brands)
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filter["props.brand"] = { $in: brands };
    }

    // 3️⃣ Color filter (multiple colors)
    if (colors && Array.isArray(colors) && colors.length > 0) {
      filter["locs.singles.color.en"] = { $in: colors };
    }

    // 4️⃣ Count total products
    const totalProducts = await Product.countDocuments(filter);

    // 5️⃣ Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // 6️⃣ Fetch paginated products
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalPages,
        currentPage: page,
        perPage: limit,
        products,
      },
    });

  } catch (error) {
    console.error("Error fetching products with filters:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProductBySkuParent = catchAsync(async (req, res) => {
  const { sku } = req.params;
  console.log("Parent SKU:", sku);

  // Ensure sku is a string
  if (!sku || typeof sku !== "string") {
    throw new ApiError(400, "Invalid SKU format");
  }

  // Find all products with this sku_parent (no ObjectId check)
  const products = await Product.find({ "props.sku_parent": sku })
    .populate("cats", "name locs")
    .lean();

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found for this parent SKU");
  }

  const baseProduct = products[0];

  const groupedProduct = {
    _id: baseProduct._id,
    sku_parent: baseProduct.props.sku_parent,
    title: baseProduct.locs?.singles?.title || {},
    description: baseProduct.locs?.singles?.desc || {},
    color: baseProduct.locs?.singles?.color || {},
    brand: baseProduct.props.brand,
    season: baseProduct.props.season,
    category: baseProduct.cats?.[0]?.name?.locs || {},
    cats: baseProduct.cats
      ? baseProduct.cats.map((cat) => ({
          _id: cat._id,
          name: cat.name?.locs || {},
        }))
      : [],
    categoryIds: baseProduct.cats ? baseProduct.cats.map((cat) => cat._id) : [],
    composition: baseProduct.composition || [],
    care: baseProduct.locs?.singles?.care || {},
    made: baseProduct.locs?.singles?.made || {},
    fastening: baseProduct.locs?.singles?.fastening || {},
    sex: baseProduct.locs?.singles?.sex || {},
    images: baseProduct.imgs || [],
    base_price: baseProduct.stock_price,
    base_buy_price: baseProduct.props.buy_price,
    variants: [],
  };

  // Group all size variants
  for (const product of products) {
    groupedProduct.variants.push({
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
        height: product.props.model_size_height,
      },
    });
  }

  res.status(200).json({
    status: "success",
    data: groupedProduct,
  });
});

exports.getNewProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const years = parseInt(req.query.years) || 1; // Default to last 1 year

    // Calculate date range for new products (last year)
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);

    // 1️⃣ Fetch products created within the specified time range, sorted by creation date (newest first)
    const products = await Product.find({ 
      created_at: { $gte: startDate }
    })
      .sort({ created_at: -1 }) // Sort by creation date descending (newest first)
      .populate("cats", "name.locs")
      .skip((page - 1) * limit)
      .limit(limit * 5) // Fetch more to account for grouping
      .lean();

    // 2️⃣ Group products by sku_parent
    const grouped = {};
    
    products.forEach((product) => {
      const skuParent = product.props.sku_parent;
      
      if (!grouped[skuParent]) {
        // Create main product with common data (use the first variant as base)
        grouped[skuParent] = {
          _id: product._id,
          sku_parent: skuParent,
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
          composition: product.composition || [],
          care: product.locs?.singles?.care || {},
          made: product.locs?.singles?.made || {},
          fastening: product.locs?.singles?.fastening || {},
          sex: product.locs?.singles?.sex || {},
          images: product.imgs || [],
          created_at: product.created_at, // Keep creation date for sorting
          // Use average or first variant's pricing as base
          base_price: product.stock_price,
          base_buy_price: product.props.buy_price,
          variants: []
        };
      }

      // Add variant details
      grouped[skuParent].variants.push({
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
      });
    });

    // 3️⃣ Convert to array and sort by creation date (newest first)
    const groupedArray = Object.values(grouped)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 4️⃣ Get total count for accurate pagination
    const totalProducts = await Product.countDocuments({ 
      created_at: { $gte: startDate }
    });
    
    // Count distinct sku_parent values
    const distinctSkuParents = await Product.distinct('props.sku_parent', { 
      created_at: { $gte: startDate }
    });
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // 5️⃣ Apply pagination to grouped results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = groupedArray.slice(startIndex, endIndex);

    // 6️⃣ Return response
    res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalGroupedProducts,
        totalPages,
        currentPage: page,
        perPage: limit,  
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        years: years,
        startDate: startDate.toISOString()
      },
      data: {
        products: paginatedResults
      },
    });

  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching new products",
    });
  }
};
