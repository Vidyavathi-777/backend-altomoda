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
export const fetchProductsByBrand = async (brand, page = 1, limit = 20) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products/productbyBrand/${brand}?page=${page}&limit=${limit}`,
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
        console.error("Error fetching products by brand:", error);
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

// Transform product data to frontend format
export const transformProduct = (product) => {
    // Handle different image formats
    let mainImage = '';
    if (product.imgs && product.imgs.length > 0) {
        if (typeof product.imgs[0] === 'string') {
            mainImage = product.imgs[0];
        } else if (product.imgs[0].url) {
            mainImage = product.imgs[0].url;
        }
    }
    
    const color = product.locs?.singles?.color?.en || 
                product.locs?.lists?.colors?.[0]?.en || 
                product.props?.color || '';

    const title = product.locs?.singles?.title?.en || 
                product.props?.model_name || 
                product.sku || 
                'Product';

    const description = product.locs?.singles?.desc?.en || 
                      product.locs?.singles?.description?.en || '';

    // Get category name from populated cats array
    const category = product.cats?.[0]?.name?.locs?.en || 
                   product.cats?.[0]?.name || 
                   product.props?.category || 
                   'Clothing';

    // Get type from props or category
    const type = product.props?.type || 
               product.props?.product_type || 
               category;

    return {
        id: product._id || Math.random().toString(),
        sku: product.sku,
        name: product.props?.brand || 'Unknown Brand',
        productName: title,
        description: description,
        price: product.stock_price || 0,
        originalPrice: product.stock_price || 0,
        discount: 0,
        images: mainImage ? [mainImage] : [],
        brand: product.props?.brand || 'Unknown',
        category: category,
        color: color,
        type: type,
        gender: product.locs?.singles?.sex?.en || 'Unisex',
        size: product.props?.size || '',
        madeIn: product.locs?.singles?.made?.en || '',
        composition: product.composition || [],
        qty: product.qty || 0,
        inStock: (product.qty || 0) > 0,
        tag: product.tag
    };
};