import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Loader2, Filter, X } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { 
    fetchBrands, 
    fetchCategoryChildren, 
    fetchProductsByCategory,
    fetchProductsByBrand,
    fetchProductsWithFilters,
    transformProduct 
} from "../../src/api/productsApi";

const ProductsPage = () => {

      const navitems = {
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f"
  };
    // Handle flexible route params - could be gender/categoryId/brandName in any combination
    const params = useParams();
    
    // Extract params - they might be named param1, param2, param3 or gender, categoryId, brandName
    const gender = params.gender || params.param1;
    const categoryId = params.categoryId || params.param2;
    const brandName = params.brandName || params.param3;
    
    console.log("URL Params:", { gender, categoryId, brandName });
    console.log("All params:", params);
    
    const isValidObjectId = (str) => {
        return str && /^[0-9a-fA-F]{24}$/.test(str);
    };
    
    const parseUrlParams = () => {
        console.log("Parsing params:", { gender, categoryId, brandName });
        
        // Check what we have
        const hasGender = gender !== undefined;
        const hasCategoryId = categoryId !== undefined;
        const hasBrandName = brandName !== undefined;
        
        const genderIsObjectId = hasGender && isValidObjectId(gender);
        const categoryIdIsObjectId = hasCategoryId && isValidObjectId(categoryId);
        const brandNameIsObjectId = hasBrandName && isValidObjectId(brandName);
        
        // Pattern 1: /:gender/:categoryId/products (e.g., /woman/68f86b1c734810ab97bb9a31/products)
        if (hasGender && !genderIsObjectId && hasCategoryId && categoryIdIsObjectId && !hasBrandName) {
            return {
                actualGender: gender,
                actualCategoryId: categoryId,
                actualBrandName: null
            };
        }
        
        // Pattern 2: /:gender/:categoryId/:brandName/products (e.g., /woman/68f86b1c734810ab97bb9a31/Etro/products)
        if (hasGender && !genderIsObjectId && hasCategoryId && categoryIdIsObjectId && hasBrandName && !brandNameIsObjectId) {
            return {
                actualGender: gender,
                actualCategoryId: categoryId,
                actualBrandName: brandName
            };
        }
        
        // Pattern 3: /:categoryId/products (e.g., /68f86b1c734810ab97bb9a2f/products)
        if (hasGender && genderIsObjectId && !hasCategoryId && !hasBrandName) {
            return {
                actualGender: null,
                actualCategoryId: gender,
                actualBrandName: null
            };
        }
        
        // Pattern 4: /:categoryId/:brandName/products (e.g., /68f86b1c734810ab97bb9a2f/Etro/products)
        if (hasGender && genderIsObjectId && hasCategoryId && !categoryIdIsObjectId && !hasBrandName) {
            return {
                actualGender: null,
                actualCategoryId: gender,
                actualBrandName: categoryId
            };
        }
        
        // Fallback - try to intelligently parse
        let actualGender = null;
        let actualCategoryId = null;
        let actualBrandName = null;
        
        // Check each param
        if (hasGender) {
            if (genderIsObjectId) {
                actualCategoryId = gender;
            } else if (['man', 'woman', 'men', 'women', 'unisex'].includes(gender?.toLowerCase())) {
                actualGender = gender;
            } else {
                actualBrandName = gender;
            }
        }
        
        if (hasCategoryId) {
            if (categoryIdIsObjectId) {
                actualCategoryId = categoryId;
            } else {
                actualBrandName = actualBrandName || categoryId;
            }
        }
        
        if (hasBrandName) {
            if (brandNameIsObjectId) {
                actualCategoryId = actualCategoryId || brandName;
            } else {
                actualBrandName = brandName;
            }
        }
        
        return {
            actualGender,
            actualCategoryId,
            actualBrandName
        };
    };
    
    const { actualGender, actualCategoryId, actualBrandName } = parseUrlParams();
    
    console.log("Parsed Params:", { actualGender, actualCategoryId, actualBrandName });

    const [openFilters, setOpenFilters] = useState({});
    const [showMore, setShowMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [error, setError] = useState(null);
    
    const [clientFilters, setClientFilters] = useState({ color: [] });
    const [apiFilters, setApiFilters] = useState({ brand: [], category: [], type: [] });
    const [tempApiFilters, setTempApiFilters] = useState({ brand: [], category: [], type: [] });
    const [filterOptions, setFilterOptions] = useState({ brands: [], colors: [], types: [], categories: [] });

    const pageSize = 20;

    const getBaseCategoryId = () => {
        if (actualGender && !actualCategoryId) {
            return actualGender === 'man' ? '68f86b10734810ab97bb98d1' : '68f86b1c734810ab97bb9a2f';
        }
        return null;
    };

    useEffect(() => {
        loadFilterOptions();
    }, [actualGender, actualCategoryId]);

    useEffect(() => {
        setCurrentPage(1);
        loadProducts(1);
    }, [actualCategoryId, actualBrandName, apiFilters]);

    useEffect(() => {
        if (currentPage > 1) {
            loadProducts(currentPage);
        }
    }, [currentPage]);

    const loadFilterOptions = async () => {
        try {
            const brandsData = await fetchBrands();
            
            let typesCategoryId = actualCategoryId;
            if (!typesCategoryId && actualGender) {
                typesCategoryId = actualGender === 'man' ? '68f86b10734810ab97bb98d1' : '68f86b1c734810ab97bb9a2f';
            }
            
            let typesData = [];
            if (typesCategoryId) {
                typesData = await fetchCategoryChildren(navitems.gender);
            }
            
            let categoriesData = [];
            if (actualCategoryId) {
                const baseMaleId = '68f86b10734810ab97bb98d1';
                const baseFemaleId = '68f86b1c734810ab97bb9a2f';
                
                if (actualCategoryId !== baseMaleId && actualCategoryId !== baseFemaleId) {
                    categoriesData = await fetchCategoryChildren(actualCategoryId);
                }
            }
            
            setFilterOptions({
                brands: brandsData,
                types: typesData,
                categories: categoriesData,
                colors: []
            });
        } catch (error) {
            console.error("Error loading filter options:", error);
        }
    };

    const loadProducts = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            let result;
            
            const hasActiveApiFilters = apiFilters.brand.length > 0 || 
                                    apiFilters.category.length > 0 || 
                                    apiFilters.type.length > 0;
            
            if (hasActiveApiFilters) {
                const filterPayload = buildFilterPayload();
                console.log("Using filter API with payload:", filterPayload);
                result = await fetchProductsWithFilters(filterPayload, page, pageSize);
            } else if (actualCategoryId && actualBrandName) {
                console.log("Using brand API:", actualBrandName, "with category:", actualCategoryId);
                result = await fetchProductsByBrand(actualBrandName, actualCategoryId, page, pageSize);
            } else if (actualCategoryId) {
                console.log("Using category API:", actualCategoryId);
                result = await fetchProductsByCategory(actualCategoryId, page, pageSize);
            } else {
                const baseCategoryId = getBaseCategoryId();
                if (baseCategoryId) {
                    console.log("Using base category API:", baseCategoryId);
                    result = await fetchProductsByCategory(baseCategoryId, page, pageSize);
                } else {
                    throw new Error("No category specified");
                }
            }

            if (!result) {
                throw new Error("No data received from API");
            }

            const products = result.products || [];
            const pagination = result.pagination || {
                totalPages: 1,
                totalProducts: products.length,
                currentPage: page,
                perPage: pageSize
            };

            const transformedProducts = products.map(transformProduct);

            setAllProducts(transformedProducts);
            setTotalPages(pagination.totalPages || 1);
            setTotalItems(pagination.totalProducts || transformedProducts.length);

            extractColorOptions(transformedProducts);
            
        } catch (error) {
            console.error("Load Products Error:", error);
            setError(error.message || "Failed to fetch products");
            setAllProducts([]);
            setTotalPages(0);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const buildFilterPayload = () => {
        const payload = {};
        const categoryIds = [];
        

        if (apiFilters.type?.length > 0) {
            apiFilters.type.forEach(catName => {
                const categoryObj = filterOptions.types.find(c => c.name === catName);
                if (categoryObj?.id && !categoryIds.includes(categoryObj.id)) {
                    categoryIds.push(categoryObj.id);
                }
            });
        }
        
        if (apiFilters.category?.length > 0) {
            apiFilters.category.forEach(catName => {
                const categoryObj = filterOptions.categories.find(c => c.name === catName);
                if (categoryObj?.id && !categoryIds.includes(categoryObj.id)) {
                    categoryIds.push(categoryObj.id);
                }
            });
        }
        if (actualCategoryId && !categoryIds.includes(actualCategoryId)) {
  categoryIds.push(actualCategoryId);
}
        
        if (categoryIds.length > 0) {
            payload.categoryIds = categoryIds;
        }

        const brands = [];
        
        if (actualBrandName) {
            brands.push(actualBrandName);
        }
        
        if (apiFilters.brand?.length > 0) {
            const filteredBrands = apiFilters.brand.filter(brand => 
                !actualBrandName || brand.toLowerCase() !== actualBrandName.toLowerCase()
            );
            brands.push(...filteredBrands);
        }
        
        if (brands.length > 0) {
            payload.brands = [...apiFilters.brand, actualBrandName];
        }

        if (clientFilters.color?.length > 0) {
            payload.colors = clientFilters.color;
        }

        console.log("Filter Payload:", payload);
        return payload;
    };

    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

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
                return { ...prev, brand: currentBrands.filter(v => v !== value) };
            } else {
                return { ...prev, brand: [...currentBrands, value] };
            }
        });
    };

    const handleCategoryFilterChange = (value) => {
        setTempApiFilters(prev => {
            const currentCategories = prev.category || [];
            if (currentCategories.includes(value)) {
                return { ...prev, category: currentCategories.filter(v => v !== value) };
            } else {
                return { ...prev, category: [...currentCategories, value] };
            }
        });
    };

    const handleTypeFilterChange = (value) => {
        setTempApiFilters(prev => {
            const currentTypes = prev.type || [];
            if (currentTypes.includes(value)) {
                return { ...prev, type: currentTypes.filter(v => v !== value) };
            } else {
                return { ...prev, type: [...currentTypes, value] };
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
                return { ...prev, color: currentColors.filter(v => v !== value) };
            } else {
                return { ...prev, color: [...currentColors, value] };
            }
        });
    };

    const clearAllFilters = () => {
        setClientFilters({ color: [] });
        setApiFilters({ brand: [], category: [], type: [] });
        setTempApiFilters({ brand: [], category: [], type: [] });
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
            id: "68f86b10734810ab97bb98d1",
            description: "Explore our selection of men's fashion and lifestyle products, where luxury and style converge with a curated offer from the world's top brands."
        },
        {
            gender: "woman",
            id: "68f86b1c734810ab97bb9a2f",
            description: "Our offer of designer clothing, shoes and accessories is a true expression of style and elegance, featuring a mesmerizing array of colors, textures, and designs."
        }
    ];

    const getDisplayTitle = () => {
        if (actualGender) {
            return actualGender.charAt(0).toUpperCase() + actualGender.slice(1);
        }
        return 'Products';
    };

    const filterDescription = description.find(item => 
        item.id === actualCategoryId || item.gender === actualGender
    )?.description || "";

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
            const optionName = typeof option === 'string' ? option : option.name;
            
            if (filterKey === 'brand') return tempApiFilters.brand?.includes(optionName) || false;
            if (filterKey === 'category') return tempApiFilters.category?.includes(optionName) || false;
            if (filterKey === 'type') return tempApiFilters.type?.includes(optionName) || false;
            if (filterKey === 'color') return clientFilters.color?.includes(optionName) || false;
            return false;
        };

        const handleChange = (option) => {
            const optionName = typeof option === 'string' ? option : option.name;
            
            if (filterKey === 'brand') {
                handleBrandFilterChange(optionName);
            } else if (filterKey === 'category') {
                handleCategoryFilterChange(optionName);
            } else if (filterKey === 'type') {
                handleTypeFilterChange(optionName);
            } else if (filterKey === 'color') {
                handleColorFilterChange(optionName);
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
                                const optionName = typeof option === 'string' ? option : option.name;
                                const optionKey = typeof option === 'string' ? option : option.id;
                                
                                const count = filteredProducts.filter(p => {
                                    if (filterKey === 'brand') return p.brand === optionName;
                                    if (filterKey === 'color') return p.color === optionName;
                                    if (filterKey === 'type') return p.type === optionName;
                                    if (filterKey === 'category') return p.category === optionName;
                                    return false;
                                }).length;

                                return (
                                    <label key={optionKey} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={getCheckedValue(option)}
                                            onChange={() => handleChange(option)}
                                            className="cursor-pointer w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                        />
                                        <span className="flex-1 select-none">{optionName}</span>
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
                    {actualGender && (
                        <h1 className="text-2xl font-bold mb-4 uppercase">{getDisplayTitle()}</h1>
                    )}
                    {actualBrandName && (
                        <h2 className="text-xl font-medium mb-4 text-gray-600">{actualBrandName}</h2>
                    )}
                    {filterDescription && (
                        <div className="text-lg text-gray-900 font-medium leading-relaxed">
                            <p className={`${!showMore ? "line-clamp-3" : ""}`}>{filterDescription}</p>
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="text-black font-medium underline mt-2 text-sm hover:no-underline"
                            >
                                {showMore ? "show less" : "show more"}
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-medium mb-2">Error Loading Products</p>
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                        <button
                            onClick={() => loadProducts(1)}
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
                            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
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
                                <span className="ml-2 text-gray-600">Loading products...</span>
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
                                        <Link 
                                            to={`/${actualGender || 'woman'}/product/${product.sku}`}
                                            key={product.sku} 
                                            className="group cursor-pointer"
                                        >
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
                                                {product.variantCount > 1 && (
                                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-xs">
                                                        {product.variantCount} sizes
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base uppercase tracking-wider group-hover:underline font-medium">
                                                    {product.name}
                                                </h3>
                                                <p className="text-md text-gray-900 line-clamp-2">{product.productName}</p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <p className="text-base font-semibold">
                                                        {product.minPrice === product.maxPrice 
                                                            ? `Eur ${product.minPrice.toFixed(2)}`
                                                            : `Eur ${product.minPrice.toFixed(2)} - ${product.maxPrice.toFixed(2)}`
                                                        }
                                                    </p>
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