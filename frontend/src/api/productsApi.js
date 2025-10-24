const API_BASE_URL = import.meta.env.VITE_API_URL;

// Fetch all brands
export const fetchBrands = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/brands`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                return data.data.brands || [];
            }
        }
        return [];
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
};

// Fetch category children (for types and categories filter)
export const fetchCategoryChildren = async (categoryId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categoryChildren/${categoryId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success' && data.data && Array.isArray(data.data)) {
                const categories = data.data.map(cat => ({
                    id: cat._id,
                    name: cat.name?.locs?.en || cat.name
                })).filter(cat => cat.name);

                return categories;
            }
        }
        return [];
    } catch (error) {
        console.error("Error fetching category children:", error);
        return [];
    }
};
// Fetch products by category
export const fetchProductsByCategory = async (categoryId, page = 1, limit = 20) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/productbyCategroy/${categoryId}?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return {
                products: data.data.products || [],
                pagination: data.pagination || {
                    totalProducts: 0,
                    totalPages: 0,
                    currentPage: page,
                    perPage: limit
                }
            };
        }
        
        throw new Error(data.message || 'Failed to fetch products');
    } catch (error) {
        console.error("Error fetching products by category:", error);
        throw error;
    }
};

// Fetch products by brand (updated for new grouped structure)
export const fetchProductsByBrand = async (brand, categoryId , page = 1, limit = 20) => {
    try {
        let url = `${API_BASE_URL}/products/productsbyBrand/${categoryId}/${brand}/?page=${page}&limit=${limit}`;
        
        // Add categoryId if provided
        // if (categoryId) {
        //     url += `&categoryId=${categoryId}`;
        // }

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return {
                products: data.data.products || [],
                pagination: data.pagination || {
                    totalProducts: 0,
                    totalPages: 0,
                    currentPage: page,
                    perPage: limit
                }
            };
        }
        
        throw new Error(data.message || 'Failed to fetch products');
    } catch (error) {
        console.error("Error fetching products by brand:", error);
        throw error;
    }
};

// Fetch product by SKU (individual variant)
export const fetchProductBySku = async (sku) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/${sku}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return {
                product: data.data || null
            };
        }
        
        throw new Error(data.message || 'Failed to fetch product');
    } catch (error) {
        console.error("Error fetching product by SKU:", error);
        throw error;
    }
};

// Fetch product by SKU Parent (grouped product with all variants)
export const fetchProductBySkuParent = async (skuParent) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/productBySku/${skuParent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return {
                product: data.data || null
            };
        }
        
        throw new Error(data.message || 'Failed to fetch product');
    } catch (error) {
        console.error("Error fetching product by SKU parent:", error);
        throw error;
    }
};

// Fetch products with filters
export const fetchProductsWithFilters = async (filters, page = 1, limit = 20) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/filter?page=${page}&limit=${limit}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return {
                products: data.data.products || [],
                pagination: {
                    totalProducts: data.data.totalProducts || 0,
                    totalPages: data.data.totalPages || 0,
                    currentPage: data.data.currentPage || page,
                    perPage: data.data.perPage || limit
                }
            };
        }
        
        throw new Error(data.message || 'Failed to fetch products');
    } catch (error) {
        console.error("Error fetching products with filters:", error);
        throw error;
    }
};

// Transform grouped product data to frontend format
export const transformProduct = (product) => {
    // Handle grouped product structure (with variants) or single product
    const isGrouped = product.variants && product.variants.length > 0;
    
    // Use first variant for main product info, or the product itself if not grouped
    const baseProduct = isGrouped ? product : product;
    const firstVariant = isGrouped ? product.variants[0] : product;

    // Handle different image formats
    let mainImage = '';
    let additionalImages = [];
    
    if (baseProduct.images && baseProduct.images.length > 0) {
        baseProduct.images.forEach(img => {
            if (typeof img === 'string') {
                if (!mainImage) mainImage = img;
                else additionalImages.push(img);
            } else if (img.url) {
                if (!mainImage) mainImage = img.url;
                else additionalImages.push(img.url);
            }
        });
    } else if (baseProduct.imgs && baseProduct.imgs.length > 0) {
        baseProduct.imgs.forEach(img => {
            if (typeof img === 'string') {
                if (!mainImage) mainImage = img;
                else additionalImages.push(img);
            } else if (img.url) {
                if (!mainImage) mainImage = img.url;
                else additionalImages.push(img.url);
            }
        });
    }

    const color = baseProduct.locs?.singles?.color?.en || 
                baseProduct.color?.en ||
                baseProduct.locs?.lists?.colors?.[0]?.en || 
                baseProduct.props?.color || '';

    const title = baseProduct.locs?.singles?.title?.en || 
                baseProduct.title?.en ||
                baseProduct.props?.model_name || 
                baseProduct.sku_parent || 
                baseProduct.sku || 
                'Product';

    const description = baseProduct.locs?.singles?.desc?.en || 
                      baseProduct.description?.en ||
                      baseProduct.locs?.singles?.description?.en || '';

    // Get category name from populated cats array
    const category = baseProduct.cats?.[0]?.name?.locs?.en || 
                   baseProduct.cats?.[0]?.name?.en ||
                   baseProduct.category?.en ||
                   baseProduct.props?.category || 
                   'Clothing';

    // Get all available sizes from variants
    const availableSizes = isGrouped 
        ? product.variants.map(variant => ({
            size: variant.size,
            sku: variant.sku,
            stock: variant.stock,
            price: variant.price,
            inStock: (variant.stock || 0) > 0,
            barcode: variant.barcode,
            modelMeasurements: variant.model_measurements
        }))
        : [{
            size: baseProduct.props?.size || '',
            sku: baseProduct.sku,
            stock: baseProduct.qty || 0,
            price: baseProduct.stock_price || 0,
            inStock: (baseProduct.qty || 0) > 0,
            barcode: baseProduct.props?.barcode,
            modelMeasurements: {
                waist: baseProduct.props?.model_size_waistline,
                hip: baseProduct.props?.model_size_hip,
                chest: baseProduct.props?.model_size_chest,
                height: baseProduct.props?.model_size_height
            }
        }];

    // Calculate price range if multiple variants
    const prices = availableSizes.map(size => size.price).filter(price => price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : baseProduct.base_price || baseProduct.stock_price || 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : baseProduct.base_price || baseProduct.stock_price || 0;
    const displayPrice = minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`;

    // Check overall stock availability
    const totalStock = availableSizes.reduce((sum, size) => sum + (size.stock || 0), 0);
    const inStock = totalStock > 0;

    return {
        id: baseProduct._id || Math.random().toString(),
        sku: baseProduct.sku_parent || baseProduct.sku,
        name: baseProduct.brand || baseProduct.props?.brand || 'Unknown Brand',
        productName: title,
        description: description,
        price: displayPrice,
        originalPrice: displayPrice, // You might want to calculate this differently if you have discount logic
        minPrice: minPrice,
        maxPrice: maxPrice,
        discount: 0,
        images: [mainImage, ...additionalImages].filter(img => img !== ''),
        brand: baseProduct.brand || baseProduct.props?.brand || 'Unknown',
        category: category,
        color: color,
        type: baseProduct.props?.type || category,
        gender: baseProduct.locs?.singles?.sex?.en || baseProduct.sex?.en || 'Unisex',
        sizes: availableSizes,
        madeIn: baseProduct.locs?.singles?.made?.en || baseProduct.made?.en || '',
        composition: baseProduct.composition || [],
        care: baseProduct.locs?.singles?.care?.en || baseProduct.care?.en || '',
        fastening: baseProduct.locs?.singles?.fastening?.en || baseProduct.fastening?.en || '',
        qty: totalStock,
        inStock: inStock,
        tag: baseProduct.tag,
        // Additional grouped product info
        isGrouped: isGrouped,
        variantCount: isGrouped ? product.variants.length : 1,
        basePrice: baseProduct.base_price || baseProduct.stock_price || 0,
        baseBuyPrice: baseProduct.base_buy_price || baseProduct.props?.buy_price || 0,
        variants: isGrouped ? product.variants : undefined,
        // Additional product details
        season: baseProduct.season || baseProduct.props?.season,
        sizeConversion: baseProduct.locs?.singles?.size_conversion?.en || baseProduct.size_conversion?.en || ''
    };
};

// Helper function to get product by SKU from grouped products
export const getVariantBySku = (product, sku) => {
    if (product.variants && product.variants.length > 0) {
        return product.variants.find(variant => variant.sku === sku);
    }
    return null;
};

// Helper function to get available sizes with stock info
export const getAvailableSizes = (product) => {
    if (product.variants && product.variants.length > 0) {
        return product.variants.map(variant => ({
            size: variant.size,
            sku: variant.sku,
            inStock: (variant.stock || 0) > 0,
            price: variant.price,
            stock: variant.stock
        }));
    }
    return [{
        size: product.props?.size || '',
        sku: product.sku,
        inStock: (product.qty || 0) > 0,
        price: product.stock_price || 0,
        stock: product.qty || 0
    }];
};

// Helper to find product by any SKU (searches through variants)
export const findProductByAnySku = async (sku) => {
    try {
        // First try to get the individual product by SKU
        try {
            const individualProduct = await fetchProductBySku(sku);
            if (individualProduct.product) {
                return transformProduct(individualProduct.product);
            }
        } catch (error) {
            console.log('Product not found by individual SKU, trying SKU parent...');
        }

        // If individual product not found, try to extract SKU parent and fetch grouped product
        const skuParent = sku.split('-').slice(0, -1).join('-');
        if (skuParent && skuParent !== sku) {
            const groupedProduct = await fetchProductBySkuParent(skuParent);
            if (groupedProduct.product) {
                const transformed = transformProduct(groupedProduct.product);
                // Find the specific variant within the grouped product
                const variant = getVariantBySku(transformed, sku);
                if (variant) {
                    return {
                        ...transformed,
                        selectedVariant: variant
                    };
                }
            }
        }

        throw new Error('Product not found');
    } catch (error) {
        console.error("Error finding product by SKU:", error);
        throw error;
    }
};