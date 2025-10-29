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


exports.getProductsByCategory = catchAsync(async (req, res) => {
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
           categoryIds: product.cats ? product.cats.map(cat => cat._id) : [],
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
});

exports.getProductsByBrand = catchAsync(async (req, res) => {
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
});


exports.getProductsWithFilters = catchAsync(async (req, res) => {
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
    const { categoryIds, brands, colors } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filter = {};

    // 🟩 1️⃣ Handle multiple categories
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

    // 🟨 2️⃣ Brand filter (multiple brands)
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filter["props.brand"] = { $in: brands };
    }

    // 🟦 3️⃣ Color filter (multiple colors)
    if (colors && Array.isArray(colors) && colors.length > 0) {
      filter["locs.singles.color.en"] = { $in: colors };
    }

    // 🟧 4️⃣ Count distinct sku_parent for correct pagination
    const distinctSkuParents = await Product.distinct("props.sku_parent", filter);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // 🟩 5️⃣ Get paginated sku_parents
    const paginatedSkuParents = distinctSkuParents.slice((page - 1) * limit, page * limit);

    // 🟨 6️⃣ Fetch products belonging to paginated sku_parents
    const paginatedFilter = {
      ...filter,
      "props.sku_parent": { $in: paginatedSkuParents },
    };

    const products = await Product.find(paginatedFilter)
      .populate("cats", "name locs")
      .lean();

    // 🟦 7️⃣ Group by sku_parent
    const grouped = {};

    products.forEach((product) => {
      const skuParent = product.props.sku_parent;

      if (!grouped[skuParent]) {
        grouped[skuParent] = {
          _id: product._id,
          sku_parent: skuParent,
          title: product.locs?.singles?.title || {},
          description: product.locs?.singles?.desc || {},
          color: product.locs?.singles?.color || {},
          brand: product.props.brand,
          season: product.props.season,
          category: product.cats?.[0]?.name?.locs || {},
          cats: product.cats
            ? product.cats.map((cat) => ({
                _id: cat._id,
                name: cat.name?.locs || {},
              }))
            : [],
             categoryIds: product.cats ? product.cats.map(cat => cat._id) : [],
          composition: product.composition || [],
          care: product.locs?.singles?.care || {},
          made: product.locs?.singles?.made || {},
          fastening: product.locs?.singles?.fastening || {},
          sex: product.locs?.singles?.sex || {},
          images: product.imgs || [],
          base_price: product.stock_price,
          base_buy_price: product.props.buy_price,
          variants: [],
        };
      }

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
          height: product.props.model_size_height,
        },
      });
    });

    // 🟨 8️⃣ Convert to array and maintain correct pagination order
    const groupedArray = paginatedSkuParents
      .map((skuParent) => grouped[skuParent])
      .filter((item) => item !== undefined);

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
        products: groupedArray,
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


exports.getNewProducts = catchAsync(async (req, res) => {
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

  try {
    const { categoryId } = req.params; // Compulsory category ID from params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Validate compulsory category ID
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required in URL parameters",
      });
    }

    let filter = {};

    // 🟩 1️⃣ Handle category hierarchy (compulsory)
    let allCategoryIds = [];

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

    allCategoryIds = getAllCategoryIds(categoryHierarchy);

    if (allCategoryIds.length > 0) {
      filter.cats = { $in: allCategoryIds };
    }

    // 🟧 2️⃣ Count distinct sku_parent for correct pagination
    const distinctSkuParents = await Product.distinct("props.sku_parent", filter);
    const totalGroupedProducts = distinctSkuParents.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // 🟩 3️⃣ Get paginated sku_parents
    const paginatedSkuParents = distinctSkuParents.slice((page - 1) * limit, page * limit);

    // If no products found
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

    // 🟨 4️⃣ Fetch products belonging to paginated sku_parents
    const paginatedFilter = {
      ...filter,
      "props.sku_parent": { $in: paginatedSkuParents },
    };

    const products = await Product.find(paginatedFilter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("cats", "name locs")
      .lean();

    // 🟦 5️⃣ Group by sku_parent
    const grouped = {};

    products.forEach((product) => {
      const skuParent = product.props?.sku_parent || "unknown";

      if (!grouped[skuParent]) {
        // Find the first product in this group to get creation date
        const firstProductInGroup = products.find(p => p.props?.sku_parent === skuParent);
        
        grouped[skuParent] = {
          _id: product._id,
          sku_parent: skuParent,
          title: product.locs?.singles?.title || {},
          description: product.locs?.singles?.desc || {},
          color: product.locs?.singles?.color || {},
          brand: product.props?.brand,
          season: product.props?.season,
          category: product.cats?.[0]?.name?.locs || {},
          cats: product.cats
            ? product.cats.map((cat) => ({
                _id: cat._id,
                name: cat.name?.locs || {},
              }))
            : [],
          categoryIds: product.cats ? product.cats.map(cat => cat._id) : [],
          composition: product.composition || [],
          care: product.locs?.singles?.care || {},
          made: product.locs?.singles?.made || {},
          fastening: product.locs?.singles?.fastening || {},
          sex: product.locs?.singles?.sex || {},
          images: product.imgs || [],
          base_price: product.stock_price,
          base_buy_price: product.props?.buy_price,
          createdAt: firstProductInGroup?.createdAt || product.createdAt, // Use first product's creation date
          variants: [],
        };
      }

      // Add variant info
      grouped[skuParent].variants.push({
        _id: product._id,
        sku: product.sku,
        size: product.props?.size,
        size_conversion: product.locs?.singles?.size_conversion || {},
        stock: product.qty,
        price: product.stock_price,
        buy_price: product.props?.buy_price,
        barcode: product.props?.barcode,
        model_measurements: {
          waist: product.props?.model_size_waistline,
          hip: product.props?.model_size_hip,
          chest: product.props?.model_size_chest,
          height: product.props?.model_size_height,
        },
        variantCreatedAt: product.createdAt, // Keep individual variant creation date
      });
    });

    // 🟨 6️⃣ Convert to array and maintain correct pagination order
    const groupedArray = paginatedSkuParents
      .map((skuParent) => grouped[skuParent])
      .filter((item) => item !== undefined);

    // 🟩 7️⃣ Sort grouped array by creation date (newest first)
    groupedArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        products: groupedArray,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching new products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching new products",
    });
  }
});

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
