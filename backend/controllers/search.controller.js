const Product = require("../models/Product");
const Category = require("../models/Category");

const getAllCategoryIds = (category) => {
    let ids = [category._id.toString()];
    if (category.children && category.children.length > 0) {
        category.children.forEach((child) => {
            ids = ids.concat(getAllCategoryIds(child));
        });
    }
    return ids;
};

const calculateDiscount = (stockPrice, buyPrice) => {
    if (!stockPrice || !buyPrice || stockPrice <= buyPrice) return 0;
    return Math.round(((stockPrice - buyPrice) / stockPrice) * 100);
};

// Helper function to create standardized product structure
const createStandardizedProduct = (product) => {
    const basePrice = product.stock_price;
    const buyPrice = product.props?.buy_price;
    const discount = calculateDiscount(basePrice, buyPrice);

    return {
        _id: product._id,
        sku_parent: product.props?.sku_parent,
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
        categoryIds: product.cats ? product.cats.map((cat) => cat._id) : [],
        composition: product.composition || [],
        care: product.locs?.singles?.care || {},
        made: product.locs?.singles?.made || {},
        fastening: product.locs?.singles?.fastening || {},
        sex: product.locs?.singles?.sex || {},
        images: product.imgs || [],
        base_price: basePrice,
        base_buy_price: buyPrice,
        discountPercentage: discount,
        createdAt: product.createdAt,
        variants: []
    };
};

// Helper function to create standardized variant structure
const createStandardizedVariant = (product) => {
    return {
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
            height: product.props?.model_size_height
        }
    };
};

exports.searchProducts = async (req, res) => {
    try {
        const {
            search, // Unified search parameter for everything
            page = 1,
            limit = 20,
        } = req.query;

        // console.log("Search query received:", search);

        let filter = {
            // Only include products with images
            imgs: { $exists: true, $ne: [], $not: { $size: 0 } }
        };

        // 🔹 If search parameter is provided, search across all fields
        if (search) {
            const searchTerms = search.trim();
            
            // Try to find categories by name first
            let categoryIdsFromSearch = [];
            const categorySearch = await Category.find({
                $or: [
                    { "name.locs.en": { $regex: searchTerms, $options: "i" } },
                    { "name.locs.it": { $regex: searchTerms, $options: "i" } },
                    { "name.locs.zh": { $regex: searchTerms, $options: "i" } }
                ]
            }).populate("children");

            for (const category of categorySearch) {
                categoryIdsFromSearch = categoryIdsFromSearch.concat(getAllCategoryIds(category));
            }

            // Remove duplicates
            categoryIdsFromSearch = [...new Set(categoryIdsFromSearch)];

            // console.log(`Found ${categoryIdsFromSearch.length} category IDs for search: ${searchTerms}`);

            // Build the main search filter
            filter.$or = [
                // Product title search
                { "locs.singles.title.en": { $regex: searchTerms, $options: "i" } },
                { "locs.singles.title.it": { $regex: searchTerms, $options: "i" } },
                { "locs.singles.title.zh": { $regex: searchTerms, $options: "i" } },
                
                // Product description search
                { "locs.singles.desc.en": { $regex: searchTerms, $options: "i" } },
                { "locs.singles.desc.it": { $regex: searchTerms, $options: "i" } },
                
                // Brand search
                { "props.brand": { $regex: searchTerms, $options: "i" } },
                
                
                // Color search
                { "locs.singles.color.en": { $regex: searchTerms, $options: "i" } },
                { "locs.singles.color.it": { $regex: searchTerms, $options: "i" } },
                
                // SKU search
                { "props.sku_parent": { $regex: searchTerms, $options: "i" } },
                { "sku": { $regex: searchTerms, $options: "i" } },
                
                // Season search
                { "props.season": { $regex: searchTerms, $options: "i" } },
                
                // Gender search
                { "locs.singles.sex.en": { $regex: searchTerms, $options: "i" } },
                { "locs.singles.sex.it": { $regex: searchTerms, $options: "i" } },
                
                // Category search (if we found matching categories)
                ...(categoryIdsFromSearch.length > 0 ? [{ "cats": { $in: categoryIdsFromSearch } }] : [])
            ];

            // If it looks like a price search (numbers only or with currency symbols)
            if (/^[€$£]?\s*\d+([.,]\d+)?\s*[-–—]?\s*[€$£]?\s*\d*([.,]\d+)?$/.test(searchTerms)) {
                const priceMatch = searchTerms.replace(/[€$£\s]/g, '').match(/(\d+)[-–—]?(\d*)/);
                if (priceMatch) {
                    const minPrice = parseFloat(priceMatch[1]);
                    const maxPrice = priceMatch[2] ? parseFloat(priceMatch[2]) : minPrice + 100;
                    
                    filter.$or.push({
                        stock_price: {
                            $gte: minPrice - 10,
                            $lte: maxPrice + 10
                        }
                    });
                }
            }
        }

        // console.log("Final filter:", JSON.stringify(filter, null, 2));

        // 🔹 Count distinct sku_parent values for accurate pagination
        const distinctSkuParents = await Product.distinct('props.sku_parent', filter);
        const totalGroupedProducts = distinctSkuParents.length;
        const totalPages = Math.ceil(totalGroupedProducts / limit);

        // 🔹 Get paginated sku_parents
        const skip = (page - 1) * limit;
        const paginatedSkuParents = distinctSkuParents.slice(skip, skip + parseInt(limit));

        // 🔹 Fetch all products belonging to paginated sku_parents
        let products = [];
        if (paginatedSkuParents.length > 0) {
            products = await Product.find({
                ...filter,
                'props.sku_parent': { $in: paginatedSkuParents }
            })
            .populate("cats", "name locs")
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();
        }

        // 🔹 Group products by sku_parent
        const grouped = {};
        
        products.forEach((product) => {
            const skuParent = product.props?.sku_parent;
            
            if (!grouped[skuParent]) {
                grouped[skuParent] = createStandardizedProduct(product);
            }

            grouped[skuParent].variants.push(createStandardizedVariant(product));
        });

        // 🔹 Convert to array and maintain correct pagination order
        const groupedArray = paginatedSkuParents
            .map((skuParent) => grouped[skuParent])
            .filter((item) => item !== undefined);

        // ✅ Clean response
        res.status(200).json({
            success: true,
            pagination: {
                totalProducts: totalGroupedProducts,
                totalPages,
                currentPage: Number(page),
                perPage: Number(limit),
                hasNextPage: Number(page) < totalPages,
                hasPrevPage: Number(page) > 1,
            },
            data: {
                products: groupedArray,
            },
        });
    } catch (error) {
        console.error("Search Error", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};