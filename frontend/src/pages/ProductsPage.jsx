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
    const [sortBy, setSortBy] = useState("Ranking");
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [error, setError] = useState(null);
    
    // Client-side filters (color, type, subcategory)
    const [clientFilters, setClientFilters] = useState({
        color: [],
        type: [],
        subcategory: [],
    });
    
    // API filters (brand, category) - these need apply button
    const [apiFilters, setApiFilters] = useState({
        brand: [],
        category: [],
    });
    
    // Temporary API filters (before applying)
    const [tempApiFilters, setTempApiFilters] = useState({
        brand: [],
        category: [],
    });

    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        colors: [],
        types: [],
        categories: [],
        subcategories: []
    });

    const pageSize = 20;
    const API_TOKEN = "Bearer 55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch products when URL params or API filters change
    useEffect(() => {
        setCurrentPage(0);
        fetchProducts(0);
    }, [actualCategoryId, actualBrandName, apiFilters, sortBy]);

    // Fetch products when page changes
    useEffect(() => {
        if (currentPage > 0) {
            fetchProducts(currentPage);
        }
    }, [currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`https://backend-altomoda.vercel.app/api/products/categories/tree`, {
                headers: {
                    'Authorization': API_TOKEN,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const extractCategories = (cats, result = []) => {
                    cats.forEach(cat => {
                        result.push({
                            id: cat.id?.$oid,
                            name: cat.name
                        });
                        if (cat.children && cat.children.length > 0) {
                            extractCategories(cat.children, result);
                        }
                    });
                    return result;
                };
                
                const allCategories = extractCategories(data);
                setFilterOptions(prev => ({ ...prev, categories: allCategories }));
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const buildApiFilter = () => {
        const filter = {
            images_option: "WITH_IMAGES"
        };

        // Brand filter - from URL or API filters
        const brands = [];
        if (actualBrandName) {
            brands.push(actualBrandName);
        }
        if (apiFilters.brand?.length > 0) {
            apiFilters.brand.forEach(b => {
                if (!brands.includes(b)) brands.push(b);
            });
        }
        if (brands.length > 0) {
            filter.brands = { op: "IN", values: brands };
        }

        // Category filter - collect all category IDs
        const categoryIds = [];

        // Priority 1: actualCategoryId from URL (validated ObjectId)
        if (actualCategoryId) {
            categoryIds.push({ "$oid": actualCategoryId.trim() });
        }

        // Priority 2: API category filters
        if (apiFilters.category?.length > 0) {
            apiFilters.category.forEach(catName => {
                const categoryObj = filterOptions.categories.find(c => c.name === catName);
                if (categoryObj?.id) {
                    const idString = String(categoryObj.id).trim();
                    if (!categoryIds.some(c => c["$oid"] === idString)) {
                        categoryIds.push({ "$oid": idString });
                    }
                }
            });
        }

        if (categoryIds.length > 0) {
            filter.cat_ids = { 
                op: "IN", 
                values: categoryIds 
            };
        }

        // console.log("=== API FILTER ===");
        // console.log("actualCategoryId:", actualCategoryId);
        // console.log("actualBrandName:", actualBrandName);
        // console.log("Filter:", JSON.stringify(filter, null, 2));
        // console.log("==================");
        
        return filter;
    };

    const getSortExpression = () => {
        switch (sortBy) {
            case "Price: Low to High": return "stock_price[ASC]";
            case "Price: High to Low": return "stock_price[DESC]";
            case "Newest": return "last_info_update[DESC]";
            default: return "_id[ASC]";
        }
    };

    const fetchProducts = async (pageIndex = 0) => {
        setLoading(true);
        setError(null);
        
        try {
            const filter = buildApiFilter();
            const sortExpression = getSortExpression();
            
            const apiUrl = `https://backend-altomoda.vercel.app/api/products?_pageIndex=${pageIndex}&_pageSize=${pageSize}_`;
            
            const requestOptions = {
                method: "POST",
                headers: {
                    'Authorization': API_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filter)
            };

            console.log("Fetching:", apiUrl);
            console.log("Payload:", JSON.stringify(filter, null, 2));

            const response = await fetch(apiUrl, requestOptions);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } else {
                        const errorText = await response.text();
                        if (errorText) errorMessage = errorText;
                    }
                } catch (e) {}
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("API Response:", data);
            
            let transformedProducts = [];
            
            if (data.content && Array.isArray(data.content)) {
                transformedProducts = data.content.flatMap(parent => {
                    if (parent.items && Array.isArray(parent.items)) {
                        return parent.items.map(item => {
                            const mainImage = item.imgs?.find(img => 
                                img.placement?.includes("LIST")
                            ) || item.imgs?.[0];
                            
                            const color = item.locs?.singles?.color?.en || 
                                        item.locs?.lists?.colors?.[0]?.en || 
                                        item.props?.color || '';

                            const title = item.locs?.singles?.title?.en || 
                                        item.props?.model_name || 
                                        parent.parent_sku || 
                                        'Product';

                            const description = item.locs?.singles?.desc?.en || 
                                              item.locs?.singles?.description?.en || '';

                            return {
                                id: item.item_id?.$oid || Math.random().toString(),
                                sku: item.sku || parent.parent_sku,
                                name: item.props?.brand || 'Unknown Brand',
                                productName: title,
                                description: description,
                                price: item.stock_price || 0,
                                originalPrice: item.stock_price || 0,
                                discount: 0,
                                images: mainImage ? [mainImage.url] : [],
                                brand: item.props?.brand || 'Unknown',
                                category: item.props?.category || 'Clothing',
                                subcategory: item.props?.subcategory || 'General',
                                color: color,
                                type: item.props?.type || item.props?.product_type || '',
                                gender: item.locs?.singles?.sex?.en || gender,
                                size: item.props?.size || '',
                                madeIn: item.locs?.singles?.made?.en || '',
                                composition: item.composition || [],
                                qty: item.qty || 0,
                                inStock: (item.qty || 0) > 0,
                                tag: item.tag
                            };
                        });
                    }
                    return [];
                });
            }

            setAllProducts(transformedProducts);
            setTotalPages(data._metadata?.total_pages || 1);
            setTotalItems(data._metadata?.total_items || transformedProducts.length);

            extractFilterOptions(transformedProducts);
            
        } catch (error) {
            console.error("Fetch Error:", error);
            setError(error.message || "Failed to fetch products");
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtered products
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Apply color filter
        if (clientFilters.color.length > 0) {
            filtered = filtered.filter(p => 
                clientFilters.color.some(color => 
                    p.color?.toLowerCase().includes(color.toLowerCase())
                )
            );
        }

        // Apply type filter
        if (clientFilters.type.length > 0) {
            filtered = filtered.filter(p => 
                clientFilters.type.includes(p.type)
            );
        }

        // Apply subcategory filter
        if (clientFilters.subcategory.length > 0) {
            filtered = filtered.filter(p => 
                clientFilters.subcategory.includes(p.subcategory)
            );
        }

        return filtered;
    }, [allProducts, clientFilters]);

    const extractFilterOptions = (productList) => {
        const brands = [...new Set(productList.map(p => p.brand).filter(Boolean))];
        const colors = [...new Set(productList.map(p => p.color).filter(Boolean))];
        const types = [...new Set(productList.map(p => p.type).filter(Boolean))];
        const categories = [...new Set(productList.map(p => p.category).filter(Boolean))];
        const subcategories = [...new Set(productList.map(p => p.subcategory).filter(Boolean))];

        setFilterOptions(prev => ({
            brands: brands.length > 0 ? brands : prev.brands,
            colors: colors.length > 0 ? colors : prev.colors,
            types: types.length > 0 ? types : prev.types,
            categories: categories.length > 0 ? [...new Set([...prev.categories.map(c => c.name), ...categories])].map(name => 
                prev.categories.find(c => c.name === name) || { name, id: null }
            ) : prev.categories,
            subcategories: subcategories.length > 0 ? subcategories : prev.subcategories
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
    
    const applyApiFilters = () => {
        setApiFilters(tempApiFilters);
        setShowMobileFilters(false);
    };

    const handleClientFilterChange = (filterKey, value) => {
        setClientFilters(prev => {
            const currentValues = prev[filterKey] || [];
            if (currentValues.includes(value)) {
                return {
                    ...prev,
                    [filterKey]: currentValues.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    [filterKey]: [...currentValues, value]
                };
            }
        });
    };

    const clearAllFilters = () => {
        setClientFilters({
            color: [],
            type: [],
            subcategory: [],
        });
        setApiFilters({
            brand: [],
            category: [],
        });
        setTempApiFilters({
            brand: [],
            category: [],
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages && !loading) {
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
    const filterDescription = description.find(item => item.id === actualCategoryId || item.gender == gender)?.description || "";

    const totalActiveFilters = [...(apiFilters.brand || []), ...(apiFilters.category || []), ...clientFilters.color, ...clientFilters.type, ...clientFilters.subcategory].length;
    const hasPendingApiFilters = JSON.stringify(tempApiFilters) !== JSON.stringify(apiFilters);

    const FilterSection = ({ title, filterKey, options, isApiFilter = false }) => {
        const displayOptions = Array.isArray(options) ? 
            (options[0]?.name ? options.map(o => o.name) : options) : [];

        const getCheckedValue = (option) => {
            if (filterKey === 'brand') return tempApiFilters.brand?.includes(option) || false;
            if (filterKey === 'category') return tempApiFilters.category?.includes(option) || false;
            return clientFilters[filterKey]?.includes(option) || false;
        };

        const handleChange = (option) => {
            if (filterKey === 'brand') {
                handleBrandFilterChange(option);
            } else if (filterKey === 'category') {
                handleCategoryFilterChange(option);
            } else {
                handleClientFilterChange(filterKey, option);
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
                                    if (filterKey === 'subcategory') return p.subcategory === option;
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
                    <div className="text-lg text-gray-900  font-medium leading-relaxed">
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
                        {/* <p className="text-red-600 text-sm mb-3">{error}</p> */}
                        <button
                            onClick={() => fetchProducts(0)}
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
                            <option>Ranking</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Newest</option>
                        </select>
                    </div>
                </div>

                {totalActiveFilters > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {[...(apiFilters.brand || []).map(v => ({ key: 'brand', value: v, isApi: true })),
                          ...(apiFilters.category || []).map(v => ({ key: 'category', value: v, isApi: true })),
                          ...clientFilters.color.map(v => ({ key: 'color', value: v, isApi: false })),
                          ...clientFilters.type.map(v => ({ key: 'type', value: v, isApi: false })),
                          ...clientFilters.subcategory.map(v => ({ key: 'subcategory', value: v, isApi: false }))
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
                                            }
                                            if (key === 'category') {
                                                const newCategories = apiFilters.category.filter(c => c !== value);
                                                setApiFilters(prev => ({ ...prev, category: newCategories }));
                                                setTempApiFilters(prev => ({ ...prev, category: newCategories }));
                                            }
                                        } else {
                                            handleClientFilterChange(key, value);
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
                            <FilterSection title="Type" filterKey="type" options={filterOptions.types} />
                            <FilterSection title="Category" filterKey="category" options={filterOptions.categories} isApiFilter={true} />
                            <FilterSection title="Subcategory" filterKey="subcategory" options={filterOptions.subcategories} />
                            
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
                            <div className="absolute inset-0  bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
                            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Filters</h3>
                                        <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4  ">
                                    <FilterSection title="Designers" filterKey="brand" options={filterOptions.brands} isApiFilter={true} />
                                    <FilterSection title="Color" filterKey="color" options={filterOptions.colors} />
                                    <FilterSection title="Type" filterKey="type" options={filterOptions.types} />
                                    <FilterSection title="Category" filterKey="category" options={filterOptions.categories} isApiFilter={true} />
                                    <FilterSection title="Subcategory" filterKey="subcategory" options={filterOptions.subcategories} />
                                    
                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={applyApiFilters}
                                            className="w-full bg-black text-white font-medium  py-3 rounded text-sm uppercase tracking-wider"
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
                                                
                                                    {/* <p className="text-xs text-gray-500 capitalize">{product.tag}</p> */}
                                                
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
                                            disabled={currentPage === 0 || loading}
                                            className="px-5 py-2 border border-gray-300 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                        >
                                            Previous
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = idx;
                                                } else if (currentPage < 3) {
                                                    pageNum = idx;
                                                } else if (currentPage > totalPages - 3) {
                                                    pageNum = totalPages - 5 + idx;
                                                } else {
                                                    pageNum = currentPage - 2 + idx;
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
                                                        {pageNum + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages - 1 || loading}
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