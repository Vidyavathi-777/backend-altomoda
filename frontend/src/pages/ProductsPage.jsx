import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Loader2, Filter, X } from "lucide-react";
import { useParams, Link } from "react-router-dom";

const ProductsPage = () => {
    const { gender = 'woman', brandName, categoryId } = useParams();
    
    // Validate if categoryId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = (str) => {
        return str && /^[0-9a-fA-F]{24}$/.test(str);
    };
    
    // Determine actual values
    const actualCategoryId = isValidObjectId(categoryId) ? categoryId : null;
    const actualBrandName = !isValidObjectId(categoryId) ? categoryId : brandName;
    
    const [openFilters, setOpenFilters] = useState({});
    const [showMore, setShowMore] = useState(false);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [error, setError] = useState(null);
    
    // Client-side filters (color only)
    const [clientFilters, setClientFilters] = useState({
        color: []
    });
    
    // API filters (brand, category, type)
    const [apiFilters, setApiFilters] = useState({
        brand: [],
        category: [],
        type: []
    });
    
    // Temporary API filters (before applying)
    const [tempApiFilters, setTempApiFilters] = useState({
        brand: [],
        category: [],
        type: []
    });

    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        colors: [],
        types: [],
        categories: []
    });

    const pageSize = 20;
const API_BASE_URL = import.meta.env.VITE_API_URL;


    // Fetch brands and categories on component mount
    useEffect(() => {
        fetchBrands();
        fetchCategories();
        fetchTypes();
    }, [gender, actualCategoryId]);

    // Fetch products when URL params or API filters change
    useEffect(() => {
        setCurrentPage(1);
        fetchProducts(1);
    }, [actualCategoryId, actualBrandName, apiFilters, sortBy, sortOrder]);

    // Fetch products when page changes
    useEffect(() => {
        if (currentPage > 1) {
            fetchProducts(currentPage);
        }
    }, [currentPage]);

    const fetchBrands = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/brands`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setFilterOptions(prev => ({ 
                        ...prev, 
                        brands: data.data.brands || [] 
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            let categoryIdToFetch = actualCategoryId;
            
            // If no category ID in URL, use gender-based category
            if (!categoryIdToFetch) {
                categoryIdToFetch = gender === 'man' ? '561d7300b49dbb9c2c551be1' : '561d7300b49dbb9c2c551c29';
            }

            const response = await fetch(`${API_BASE_URL}/products/categoryChildren/${categoryId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Categories API Response:", data);
                
                if (data.content && Array.isArray(data.content)) {
                    // Extract category names from the response
                    const categories = data.data.map(cat => ({
                        id: cat._id?.$oid,
                        name: cat.name?.locs?.en || cat.name // Handle both formats
                    })).filter(cat => cat.name); // Filter out any undefined names

                    // Use the same data for both types and categories
                    const types = categories.map(cat => cat.name);

                    setFilterOptions(prev => ({ 
                        ...prev, 
                        categories: categories,
                        types: types
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchTypes = async () => {
        try {
            let categoryIdToFetch = actualCategoryId;
            
            // If no category ID in URL, use gender-based category
            if (!categoryIdToFetch) {
                categoryIdToFetch = gender === 'man' ? '68f86b10734810ab97bb98d1' : '68f86b1c734810ab97bb9a2f';
            }

            const response = await fetch(`${API_BASE_URL}/products/categoryChildren/${categoryIdToFetch}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Categories API Response:", data);
                
                if (data.content && Array.isArray(data.content)) {
                    // Extract category names from the response
                    const categories = data.data.map(cat => ({
                        id: cat._id?.$oid,
                        name: cat.name?.locs?.en || cat.name // Handle both formats
                    })).filter(cat => cat.name); // Filter out any undefined names

                    // Use the same data for both types and categories
                    const types = categories.map(cat => cat.name);

                    setFilterOptions(prev => ({ 
                        ...prev, 
                        categories: categories,
                        types: types
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    const buildApiFilter = () => {
        const filter = {
            page: currentPage,
            limit: pageSize,
            sortBy: sortBy,
            sortOrder: sortOrder
        };

        // Brand filter - from URL or API filters
        const brands = [];
        if (actualBrandName) {
            brands.push(actualBrandName);
        }
        if (apiFilters.brand?.length > 0) {
            brands.push(...apiFilters.brand);
        }
        if (brands.length > 0) {
            filter.brands = brands;
        }

        // Category filter - collect all category IDs
        const categoryIds = [];

        // Priority 1: actualCategoryId from URL (validated ObjectId)
        if (actualCategoryId) {
            categoryIds.push(actualCategoryId);
        }

        // Priority 2: API category filters
        if (apiFilters.category?.length > 0) {
            apiFilters.category.forEach(catName => {
                const categoryObj = filterOptions.categories.find(c => c.name === catName);
                if (categoryObj?.id) {
                    if (!categoryIds.includes(categoryObj.id)) {
                        categoryIds.push(categoryObj.id);
                    }
                }
            });
        }

        if (categoryIds.length > 0) {
            filter.categories = categoryIds;
        }

        // Type filter (from categories)
        if (apiFilters.type?.length > 0) {
            filter.categories = [...(filter.categories || []), ...apiFilters.type.map(typeName => {
                const typeObj = filterOptions.categories.find(c => c.name === typeName);
                return typeObj?.id;
            }).filter(Boolean)];
        }

        // Color filter (client-side only, not sent to API)
        // This will be applied client-side after fetching

        return filter;
    };

 const fetchProducts = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const filter = buildApiFilter();
            filter.page = page;

            const apiUrl = `${API_BASE_URL}/products/filter`;
            
            const requestOptions = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filter)
            };

            console.log("Fetching products:", apiUrl);
            console.log("Payload:", JSON.stringify(filter, null, 2));

            const response = await fetch(apiUrl, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Products API Response:", data);
            
            if (data.success) {
                // Transform products to match your frontend format
                const transformedProducts = data.products.map(product => {
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
                        gender: product.locs?.singles?.sex?.en || gender,
                        size: product.props?.size || '',
                        madeIn: product.locs?.singles?.made?.en || '',
                        composition: product.composition || [],
                        qty: product.qty || 0,
                        inStock: (product.qty || 0) > 0,
                        tag: product.tag
                    };
                });

                setAllProducts(transformedProducts);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalCount || transformedProducts.length);

                // Extract color options from products
                extractColorOptions(transformedProducts);
                
            } else {
                throw new Error(data.message || 'Failed to fetch products');
            }
            
        } catch (error) {
            console.error("Fetch Error:", error);
            setError(error.message || "Failed to fetch products");
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtered products (only color filter applied client-side)
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Apply color filter client-side
        if (clientFilters.color.length > 0) {
            filtered = filtered.filter(p => 
                clientFilters.color.some(color => 
                    p.color?.toLowerCase().includes(color.toLowerCase())
                )
            );
        }

        return filtered;
    }, [allProducts, clientFilters.color]);

    const extractColorOptions = (productList) => {
        const colors = [...new Set(productList.map(p => p.color).filter(Boolean))];
        setFilterOptions(prev => ({
            ...prev,
            colors: colors.length > 0 ? colors : prev.colors
        }));
    };

    const toggleFilter = (filterName) => {
        setOpenFilters((prev) => ({
            ...prev,
            [filterName]: !prev[filterName],
        }));
    };

    const handleBrandFilterChange = (value) => {
        setTempApiFilters(prev => {
            const currentBrands = prev.brand || [];
            if (currentBrands.includes(value)) {
                return {
                    ...prev,
                    brand: currentBrands.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    brand: [...currentBrands, value]
                };
            }
        });
    };

    const handleCategoryFilterChange = (value) => {
        setTempApiFilters(prev => {
            const currentCategories = prev.category || [];
            if (currentCategories.includes(value)) {
                return {
                    ...prev,
                    category: currentCategories.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    category: [...currentCategories, value]
                };
            }
        });
    };

    const handleTypeFilterChange = (value) => {
        setTempApiFilters(prev => {
            const currentTypes = prev.type || [];
            if (currentTypes.includes(value)) {
                return {
                    ...prev,
                    type: currentTypes.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    type: [...currentTypes, value]
                };
            }
        });
    };
    
    const applyApiFilters = () => {
        setApiFilters(tempApiFilters);
        setShowMobileFilters(false);
    };

    const handleColorFilterChange = (value) => {
        setClientFilters(prev => {
            const currentColors = prev.color || [];
            if (currentColors.includes(value)) {
                return {
                    ...prev,
                    color: currentColors.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    color: [...currentColors, value]
                };
            }
        });
    };

    const clearAllFilters = () => {
        setClientFilters({
            color: []
        });
        setApiFilters({
            brand: [],
            category: [],
            type: []
        });
        setTempApiFilters({
            brand: [],
            category: [],
            type: []
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && !loading) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const description = [
        {
            gender: "man",
            id: "561d7300b49dbb9c2c551be1",
            description: "Explore our selection of men's fashion and lifestyle products, where luxury and style converge with a curated offer from the world's top brands."
        },
        {
            gender: "woman",
            id: "561d7300b49dbb9c2c551c29",
            description: "Our offer of women's designer clothing, shoes and accessories is a true expression of style and elegance, featuring a mesmerizing array of colors, textures, and designs."
        }
    ];

    const currentGender = description.find(item => item.id === actualCategoryId)?.gender || gender;
    const filterDescription = description.find(item => item.id === actualCategoryId || item.gender === gender)?.description || "";

    const totalActiveFilters = [
        ...(apiFilters.brand || []), 
        ...(apiFilters.category || []), 
        ...(apiFilters.type || []),
        ...clientFilters.color
    ].length;

    const hasPendingApiFilters = JSON.stringify(tempApiFilters) !== JSON.stringify(apiFilters);

    const FilterSection = ({ title, filterKey, options, isApiFilter = false }) => {
        const displayOptions = Array.isArray(options) ? options : [];

        const getCheckedValue = (option) => {
            if (filterKey === 'brand') return tempApiFilters.brand?.includes(option) || false;
            if (filterKey === 'category') return tempApiFilters.category?.includes(option) || false;
            if (filterKey === 'type') return tempApiFilters.type?.includes(option) || false;
            if (filterKey === 'color') return clientFilters.color?.includes(option) || false;
            return false;
        };

        const handleChange = (option) => {
            if (filterKey === 'brand') {
                handleBrandFilterChange(option);
            } else if (filterKey === 'category') {
                handleCategoryFilterChange(option);
            } else if (filterKey === 'type') {
                handleTypeFilterChange(option);
            } else if (filterKey === 'color') {
                handleColorFilterChange(option);
            }
        };

        return (
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleFilter(filterKey)}
                    className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                >
                    <span className="text-sm uppercase tracking-wider text-black font-medium">{title}</span>
                    {openFilters[filterKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openFilters[filterKey] && (
                    <div className="pb-4 space-y-2 max-h-60 overflow-y-auto">
                        {displayOptions.length > 0 ? (
                            displayOptions.map((option) => {
                                const count = filteredProducts.filter(p => {
                                    if (filterKey === 'brand') return p.brand === option;
                                    if (filterKey === 'color') return p.color === option;
                                    if (filterKey === 'type') return p.type === option;
                                    if (filterKey === 'category') return p.category === option;
                                    return false;
                                }).length;

                                return (
                                    <label key={option} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={getCheckedValue(option)}
                                            onChange={() => handleChange(option)}
                                            className="cursor-pointer w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                        />
                                        <span className="flex-1 select-none">{option}</span>
                                        <span className="text-xs text-gray-500">({count})</span>
                                    </label>
                                );
                            })
                        ) : (
                            <div className="text-sm text-gray-500 italic p-2">
                                No {title.toLowerCase()} options available
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pt-[100px] sm:pt-[140px] md:pt-[100px] lg:pt-[200px]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-4 uppercase">{currentGender}</h1>
                    {actualBrandName && (
                        <h2 className="text-xl font-medium mb-4 text-gray-600">{actualBrandName}</h2>
                    )}
                    <div className="text-lg text-gray-900 font-medium leading-relaxed">
                        <p className={`${!showMore ? "line-clamp-3" : ""}`}>{filterDescription}</p>
                        {filterDescription && (
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="text-black font-medium underline mt-2 text-sm hover:no-underline"
                            >
                                {showMore ? "show less" : "show more"}
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-medium mb-2">Error Loading Products</p>
                        <button
                            onClick={() => fetchProducts(1)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">Filters</span>
                            {totalActiveFilters > 0 && (
                                <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalActiveFilters}
                                </span>
                            )}
                        </button>
                        
                        <div className="text-sm text-gray-600">
                            {loading ? "Loading..." : `${filteredProducts.length} of ${totalItems} products`}
                        </div>
                        
                        {totalActiveFilters > 0 && (
                            <button onClick={clearAllFilters} className="text-xs underline hover:no-underline text-gray-600">
                                Clear all filters
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border-0 bg-transparent focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="createdAt">Newest</option>
                            <option value="stock_price">Price</option>
                            <option value="updatedAt">Recently Updated</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="border-0 bg-transparent focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>

                {totalActiveFilters > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {[...(apiFilters.brand || []).map(v => ({ key: 'brand', value: v, isApi: true })),
                          ...(apiFilters.category || []).map(v => ({ key: 'category', value: v, isApi: true })),
                          ...(apiFilters.type || []).map(v => ({ key: 'type', value: v, isApi: true })),
                          ...clientFilters.color.map(v => ({ key: 'color', value: v, isApi: false }))
                        ].map(({ key, value, isApi }) => (
                            <span key={`${key}-${value}`} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 text-xs rounded-full">
                                {value}
                                <button
                                    onClick={() => {
                                        if (isApi) {
                                            if (key === 'brand') {
                                                const newBrands = apiFilters.brand.filter(b => b !== value);
                                                setApiFilters(prev => ({ ...prev, brand: newBrands }));
                                                setTempApiFilters(prev => ({ ...prev, brand: newBrands }));
                                            } else if (key === 'category') {
                                                const newCategories = apiFilters.category.filter(c => c !== value);
                                                setApiFilters(prev => ({ ...prev, category: newCategories }));
                                                setTempApiFilters(prev => ({ ...prev, category: newCategories }));
                                            } else if (key === 'type') {
                                                const newTypes = apiFilters.type.filter(t => t !== value);
                                                setApiFilters(prev => ({ ...prev, type: newTypes }));
                                                setTempApiFilters(prev => ({ ...prev, type: newTypes }));
                                            }
                                        } else {
                                            handleColorFilterChange(value);
                                        }
                                    }}
                                    className="hover:text-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex gap-8">
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="space-y-0 sticky top-24">
                            <FilterSection title="Designers" filterKey="brand" options={filterOptions.brands} isApiFilter={true} />
                            <FilterSection title="Color" filterKey="color" options={filterOptions.colors} />
                            <FilterSection title="Type" filterKey="type" options={filterOptions.types} isApiFilter={true} />
                            <FilterSection title="Category" filterKey="category" options={filterOptions.categories} isApiFilter={true} />
                            
                            {/* Apply Filters Button - Only show if there are pending API filter changes */}
                            {hasPendingApiFilters && (
                                <div className="pt-4 space-y-2 border-t border-gray-200 mt-4">
                                    <button
                                        onClick={applyApiFilters}
                                        className="w-full bg-black text-white py-2 px-4 rounded text-sm uppercase tracking-wider hover:bg-gray-800 transition"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={() => setTempApiFilters(apiFilters)}
                                        className="w-full border border-gray-300 py-2 px-4 rounded text-sm uppercase tracking-wider hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {showMobileFilters && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
                            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Filters</h3>
                                        <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <FilterSection title="Designers" filterKey="brand" options={filterOptions.brands} isApiFilter={true} />
                                    <FilterSection title="Color" filterKey="color" options={filterOptions.colors} />
                                    <FilterSection title="Type" filterKey="type" options={filterOptions.types} isApiFilter={true} />
                                    <FilterSection title="Category" filterKey="category" options={filterOptions.categories} isApiFilter={true} />
                                    
                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={applyApiFilters}
                                            className="w-full bg-black text-white font-medium py-3 rounded text-sm uppercase tracking-wider"
                                        >
                                            Apply Filters
                                        </button>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="w-full border text-black font-medium border-gray-300 py-3 rounded text-sm uppercase tracking-wider"
                                        >
                                            Close
                                        </button>
                                        {totalActiveFilters > 0 && (
                                            <button
                                                onClick={() => {
                                                    clearAllFilters();
                                                    setShowMobileFilters(false);
                                                }}
                                                className="w-full border border-red-300 text-red-600 py-3 rounded text-sm uppercase tracking-wider"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1">
                        {loading && allProducts.length === 0 ? (
                            <div className="flex items-center justify-center h-96">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg mb-4">No products found</p>
                                {totalActiveFilters > 0 && (
                                    <button onClick={clearAllFilters} className="text-sm underline hover:no-underline">
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8">
                                    {filteredProducts.map((product) => (
                                        <Link to={`/${currentGender}/product/${product.id}`} key={product.id} className="group cursor-pointer">
                                            <div className="relative aspect-[2/3] bg-gray-50 mb-3 overflow-hidden">
                                                {product.images[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.productName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                                {!product.inStock && (
                                                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 text-xs uppercase tracking-wider">
                                                        Out of Stock
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base uppercase tracking-wider group-hover:underline font-medium">
                                                    {product.name}
                                                </h3>
                                                <p className="text-md text-gray-900 line-clamp-2">{product.productName}</p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <p className="text-base font-semibold">Eur {product.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1 || loading}
                                            className="px-5 py-2 border border-gray-300 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                        >
                                            Previous
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = idx + 1;
                                                } else if (currentPage < 3) {
                                                    pageNum = idx + 1;
                                                } else if (currentPage > totalPages - 3) {
                                                    pageNum = totalPages - 5 + idx + 1;
                                                } else {
                                                    pageNum = currentPage - 2 + idx + 1;
                                                }

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        disabled={loading}
                                                        className={`px-4 py-2 border text-sm ${
                                                            currentPage === pageNum
                                                                ? 'bg-black text-white border-black'
                                                                : 'border-gray-300 hover:bg-gray-50'
                                                        } disabled:opacity-50 transition`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages || loading}
                                            className="px-5 py-2 border border-gray-300 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;