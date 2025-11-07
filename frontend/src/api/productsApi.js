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

// Fetch products by brand
export const fetchProductsByBrand = async (brand, categoryId, page = 1, limit = 20) => {
    try {
        let url = `${API_BASE_URL}/products/productsbyBrand/${categoryId}/${brand}?page=${page}&limit=${limit}`;

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

// Fetch new arrivals by category
export const fetchNewArrivalsByCategory = async (categoryId, page = 1, limit = 20) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/new-arrivals/${categoryId}?page=${page}&limit=${limit}`,
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
        
        throw new Error(data.message || 'Failed to fetch new arrivals');
    } catch (error) {
        console.error("Error fetching new arrivals:", error);
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
                    totalProducts: data.pagination.totalProducts || 0,
                    totalPages: data.pagination.totalPages || 0,
                    currentPage: data.pagination.currentPage || page,
                    perPage: data.pagination.perPage || limit
                }
            };
        }
        
        throw new Error(data.message || 'Failed to fetch products');
    } catch (error) {
        console.error("Error fetching products with filters:", error);
        throw error;
    }
};

// Fetch related products by SKU
export const fetchRelatedProducts = async (sku) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/related/${sku}`,
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
                products: data.data.products || []
            };
        }
        
        throw new Error(data.message || 'Failed to fetch related products');
    } catch (error) {
        console.error("Error fetching related products:", error);
        throw error;
    }
};

// Transform grouped product data to frontend format
export const transformProduct = (product) => {
    // Helper function to extract localized text
    const getLocalizedValue = (field, defaultValue = '') => {
        if (!field) return defaultValue;
        
        if (typeof field === 'string') return field;
        
        if (typeof field === 'object' && field !== null) {
            return field.en || field.it || field.es || field.nl || field.zh || 
                   Object.values(field)[0] || defaultValue;
        }
        
        return String(field || defaultValue);
    };

    // Check if product has variants (grouped structure)
    const isGrouped = product.variants && product.variants.length > 0;
    
    // Handle image formats - check both 'images' and 'imgs' fields
    let productImages = [];
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        productImages = product.images.map(img => {
            if (typeof img === 'string') return img;
            if (img.url) return img.url;
            return null;
        }).filter(Boolean);
    } else if (product.imgs && Array.isArray(product.imgs) && product.imgs.length > 0) {
        productImages = product.imgs.map(img => {
            if (typeof img === 'string') return img;
            if (img.url) return img.url;
            return null;
        }).filter(Boolean);
    }

    // Extract localized fields
    const color = getLocalizedValue(product.color);
    const title = getLocalizedValue(product.title, product.sku_parent || 'Product');
    const description = getLocalizedValue(product.description);
    const category = getLocalizedValue(product.category) || 
                    getLocalizedValue(product.cats?.[0]?.name) || 
                    'Clothing';
    const gender = getLocalizedValue(product.sex, 'Unisex');
    const madeIn = getLocalizedValue(product.made);
    const care = getLocalizedValue(product.care);
    const fastening = getLocalizedValue(product.fastening);

    // Get all available sizes from variants
    const availableSizes = isGrouped 
        ? product.variants.map(variant => ({
            size: variant.size,
            sku: variant.sku,
            stock: variant.stock || 0,
            price: variant.price || 0,
            inStock: (variant.stock || 0) > 0,
            barcode: variant.barcode,
            sizeConversion: getLocalizedValue(variant.size_conversion),
            modelMeasurements: variant.model_measurements || {}
        }))
        : [{
            size: product.size || '',
            sku: product.sku,
            stock: product.stock || 0,
            price: product.base_price || 0,
            inStock: (product.stock || 0) > 0,
            barcode: product.barcode || '',
            sizeConversion: '',
            modelMeasurements: {}
        }];

    // Calculate price range from variants
    const prices = availableSizes.map(size => size.price).filter(price => price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : product.base_price || 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : product.base_price || 0;

    // Calculate total stock
    const totalStock = availableSizes.reduce((sum, size) => sum + (size.stock || 0), 0);
    const inStock = totalStock > 0;

    // Handle composition - ensure it's properly formatted
    let composition = [];
    if (Array.isArray(product.composition)) {
        composition = product.composition.map(comp => ({
            material: getLocalizedValue(comp.material),
            perc: comp.perc || 0
        }));
    }

    return {
        id: product._id || Math.random().toString(),
        sku: product.sku_parent || product.sku,
        name: product.brand || 'Unknown Brand',
        productName: title,
        description: description,
        price: minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`,
        minPrice: minPrice,
        maxPrice: maxPrice,
        images: productImages,
        brand: product.brand || 'Unknown',
        category: category,
        color: color,
        type: getLocalizedValue(product.type) || category,
        gender: gender,
        sizes: availableSizes,
        madeIn: madeIn,
        composition: composition,
        care: care,
        fastening: fastening,
        qty: totalStock,
        inStock: inStock,
        tag: product.tag,
        // Additional grouped product info
        isGrouped: isGrouped,
        variantCount: isGrouped ? product.variants.length : 1,
        basePrice: product.base_price || 0,
        baseBuyPrice: product.base_buy_price || 0,
        variants: isGrouped ? product.variants : undefined,
        season: product.season || '',
        sizeConversion: '',
        // Category IDs for filtering
        categoryIds: product.categoryIds || (product.cats ? product.cats.map(cat => cat._id) : []),
        cats: product.cats || []
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
        size: product.size || '',
        sku: product.sku,
        inStock: (product.stock || 0) > 0,
        price: product.base_price || 0,
        stock: product.stock || 0
    }];
};

// Helper to find product by any SKU (searches through variants)
export const findProductByAnySku = async (sku) => {
    try {
        // First try to get by SKU parent
        try {
            const groupedProduct = await fetchProductBySkuParent(sku);
            if (groupedProduct.product) {
                const transformed = transformProduct(groupedProduct.product);
                return transformed;
            }
        } catch (error) {
            console.log('Product not found by SKU parent, trying individual SKU...');
        }

        // If not found, try individual product
        try {
            const individualProduct = await fetchProductBySku(sku);
            if (individualProduct.product) {
                return transformProduct(individualProduct.product);
            }
        } catch (error) {
            console.log('Product not found by individual SKU either');
        }

        throw new Error('Product not found');
    } catch (error) {
        console.error("Error finding product by SKU:", error);
        throw error;
    }
};