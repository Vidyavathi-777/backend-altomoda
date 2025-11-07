import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Loader2, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { 
    fetchBrands, 
    fetchCategoryChildren, 
    fetchProductsByCategory,
    fetchProductsByBrand,
    fetchProductsWithFilters,
    fetchNewArrivalsByCategory,
    transformProduct 
} from "../../src/api/productsApi";

const ProductsPage = () => {
    const navitems = {
        man: "68f86b10734810ab97bb98d1",
        woman: "68f86b1c734810ab97bb9a2f"
    };

    const params = useParams();
    const gender = params.gender || params.param1;
    const categoryId = params.categoryId || params.param2;
    const brandName = params.brandName || params.param3;
    const newArrival = params.newArrival || params.param4;
    
    const isValidObjectId = (str) => {
        return str && /^[0-9a-fA-F]{24}$/.test(str);
    };
    
    const parseUrlParams = () => {
        const hasGender = gender !== undefined;
        const hasCategoryId = categoryId !== undefined;
        const hasBrandName = brandName !== undefined;
        const hasNewArrivalId = newArrival !== undefined;

        const genderIsObjectId = hasGender && isValidObjectId(gender);
        const categoryIdIsObjectId = hasCategoryId && isValidObjectId(categoryId);
        const brandNameIsObjectId = hasBrandName && isValidObjectId(brandName);
        const newArrivalObjectId = hasNewArrivalId && isValidObjectId(newArrival);
        
        if (hasGender && !genderIsObjectId && hasCategoryId && categoryIdIsObjectId && !hasBrandName) {
            return { actualGender: gender, actualCategoryId: categoryId, actualBrandName: null, actualNewArrival: null };
        }
        
        if (hasGender && !genderIsObjectId && hasCategoryId && categoryIdIsObjectId && hasBrandName && !brandNameIsObjectId) {
            return { actualGender: gender, actualCategoryId: categoryId, actualBrandName: brandName, actualNewArrival: null };
        }
        
        if (hasGender && genderIsObjectId && !hasCategoryId && !hasBrandName) {
            return { actualGender: null, actualCategoryId: gender, actualBrandName: null, actualNewArrival: null };
        }
        
        if (hasGender && genderIsObjectId && hasCategoryId && !categoryIdIsObjectId && !hasBrandName) {
            return { actualGender: null, actualCategoryId: gender, actualBrandName: categoryId, actualNewArrival: null };
        }

        if (hasNewArrivalId && newArrivalObjectId) {
            return {
                actualNewArrival: newArrival,
                actualGender: gender,
                actualCategoryId: null,
                actualBrandName: null
            };
        }

        let actualGender = null;
        let actualCategoryId = null;
        let actualBrandName = null;
        let actualNewArrival = null;

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
        
        if (hasNewArrivalId) {
            if (newArrivalObjectId) {
                actualNewArrival = actualNewArrival || newArrival;
            } else {
                actualNewArrival = newArrival;
            }
        }

        return { actualGender, actualCategoryId, actualBrandName, actualNewArrival };
    };

    const { actualGender, actualCategoryId, actualBrandName, actualNewArrival } = parseUrlParams();

    const [showMore, setShowMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [productImageIndex, setProductImageIndex] = useState({});
    const [isNewArrivalMode, setIsNewArrivalMode] = useState(false);
    
    const [clientFilters, setClientFilters] = useState({ color: [] });
    const [apiFilters, setApiFilters] = useState({ brand: [], category: [], type: [] });
    const [tempApiFilters, setTempApiFilters] = useState({ brand: [], category: [], type: [] });
    const [filterOptions, setFilterOptions] = useState({ brands: [], colors: [], types: [], categories: [] });

    const pageSize = 30;

    // Reset everything when URL parameters change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(1);
        setClientFilters({ color: [] });
        setApiFilters({ brand: [], category: [], type: [] });
        setTempApiFilters({ brand: [], category: [], type: [] });
        setIsNewArrivalMode(!!actualNewArrival);
        setShowFilters(false);
    }, [actualGender, actualCategoryId, actualBrandName, actualNewArrival]);

    const getBaseCategoryId = () => {
        if (actualGender && !actualCategoryId) {
            return actualGender === 'man' ? '68f86b10734810ab97bb98d1' : '68f86b1c734810ab97bb9a2f';
        }
        return null;
    };

    useEffect(() => {
        loadFilterOptions();
    }, [actualGender, actualCategoryId, actualNewArrival]);

    useEffect(() => {
        setCurrentPage(1);
        loadProducts(1);
    }, [actualCategoryId, actualBrandName, actualNewArrival, apiFilters]);

    useEffect(() => {
        if (currentPage > 1) {
            loadProducts(currentPage);
        }
    }, [currentPage]);

    const loadFilterOptions = async () => {
        try {
            const brandsData = await fetchBrands();

            let typesCategoryId = actualCategoryId || actualNewArrival;
            if (!typesCategoryId && actualGender) {
                typesCategoryId = actualGender === 'man' ? '68f86b10734810ab97bb98d1' : '68f86b1c734810ab97bb9a2f';
            }

            let typesData = [];
            if (typesCategoryId) {
                typesData = await fetchCategoryChildren(navitems[actualGender]);
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
            
            if (hasActiveApiFilters || isNewArrivalMode) {
                const filterPayload = buildFilterPayload();
                console.log("Filter Payload:", filterPayload);
                result = await fetchProductsWithFilters(filterPayload, page, pageSize);
            } else if (actualCategoryId && actualBrandName) {
                result = await fetchProductsByBrand(actualBrandName, actualCategoryId, page, pageSize);
            } else if (actualCategoryId) {
                result = await fetchProductsByCategory(actualCategoryId, page, pageSize);
            } else if (actualNewArrival) {
                console.log("Using New-arrivals", actualNewArrival);
                result = await fetchNewArrivalsByCategory(actualNewArrival, page, pageSize);
            } else {
                const baseCategoryId = getBaseCategoryId();
                if (baseCategoryId) {
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

        if (isNewArrivalMode) {
            payload.isNewArrival = true;
            payload.days = 7;
        }

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
        
        if (actualCategoryId || actualNewArrival) {
            const baseCatId = actualCategoryId || actualNewArrival;
            if (!categoryIds.includes(baseCatId)) {
                categoryIds.push(baseCatId);
            }
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
            payload.brands = brands;
        }

        if (clientFilters.color?.length > 0) {
            payload.colors = clientFilters.color;
        }

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

    const closeFiltersAndApply = () => {
        setApiFilters(tempApiFilters);
        setShowFilters(false);
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
        if (isNewArrivalMode) {
            return 'New Arrivals';
        }
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

    const nextImage = (productId, e) => {
        e.preventDefault();
        e.stopPropagation();
        const product = filteredProducts.find(p => p.id === productId);
        if (!product) return;
        
        setProductImageIndex(prev => {
            const current = prev[productId] || 0;
            const next = (current + 1) % product.images.length;
            return { ...prev, [productId]: next };
        });
    };

    const prevImage = (productId, e) => {
        e.preventDefault();
        e.stopPropagation();
        const product = filteredProducts.find(p => p.id === productId);
        if (!product) return;
        
        setProductImageIndex(prev => {
            const current = prev[productId] || 0;
            const next = current === 0 ? product.images.length - 1 : current - 1;
            return { ...prev, [productId]: next };
        });
    };

    const FilterSection = ({ title, filterKey, options }) => {
        const [isOpen, setIsOpen] = useState(true);

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
            <div className="border-b border-gray-300 py-4 md:py-6">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between text-left"
                    style={{ fontFamily: 'Didot, serif' }}
                >
                    <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-light">{title}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                    <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                        {options && options.length > 0 ? (
                            options.map((option) => {
                                const optionName = typeof option === 'string' ? option : option.name;
                                const optionKey = typeof option === 'string' ? option : option.id;

                                return (
                                    <label 
                                        key={optionKey} 
                                        className="flex items-center gap-2 md:gap-3 cursor-pointer group"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={getCheckedValue(option)}
                                            onChange={() => handleChange(option)}
                                            className="w-3 h-3 md:w-4 md:h-4 border-2 border-black flex-shrink-0"
                                        />
                                        <span className="text-xs md:text-sm tracking-wide group-hover:opacity-60 transition-opacity">
                                            {optionName}
                                        </span>
                                    </label>
                                );
                            })
                        ) : (
                            <div className="text-xs md:text-sm text-gray-500 italic">
                                No {title.toLowerCase()} available
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pt-32 md:pt-[200px] lg:pt-[180px]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
                
                @font-face {
                    font-family: 'Didot';
                    src: local('Didot'), local('Didot LT STD');
                    font-weight: normal;
                    font-style: normal;
                }
            `}</style>

            {/* Header Section */}
            <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16 border-b border-gray-200">
                <div className="max-w-[1800px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6 md:mb-8">
                        <div>
                            <h1 
                                className="text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-4 tracking-wider font-light"
                                style={{ fontFamily: 'Didot, serif' }}
                            >
                                {getDisplayTitle()}
                            </h1>
                            {actualBrandName && (
                                <h2 
                                    className="text-lg md:text-xl lg:text-2xl tracking-[0.2em] md:tracking-[0.3em] font-light text-gray-700"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    {actualBrandName.toUpperCase()}
                                </h2>
                            )}
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 border border-black hover:bg-black hover:text-white transition-all duration-300 w-full md:w-auto justify-center"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            <Filter className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-xs md:text-sm tracking-[0.2em] uppercase">Filters</span>
                            {totalActiveFilters > 0 && (
                                <span className="bg-black text-white px-2 py-0.5 text-xs">
                                    {totalActiveFilters}
                                </span>
                            )}
                        </button>
                    </div>

                    {filterDescription && (
                        <div 
                            className="text-sm md:text-base leading-relaxed max-w-3xl"
                            style={{ fontFamily: 'Cormorant Garamond, serif' }}
                        >
                            <p className={`${!showMore ? "line-clamp-2" : ""}`}>
                                {filterDescription}
                            </p>
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="underline mt-2 text-xs md:text-sm hover:no-underline"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                {showMore ? "SHOW LESS" : "SHOW MORE"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filters */}
            {totalActiveFilters > 0 && (
                <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-gray-200">
                    <div className="max-w-[1800px] mx-auto flex flex-wrap gap-2 md:gap-3 items-center">
                        <span 
                            className="text-xs md:text-sm tracking-[0.2em] uppercase"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Active Filters:
                        </span>
                        {[...(apiFilters.brand || []).map(v => ({ key: 'brand', value: v })),
                          ...(apiFilters.category || []).map(v => ({ key: 'category', value: v })),
                          ...(apiFilters.type || []).map(v => ({ key: 'type', value: v })),
                          ...clientFilters.color.map(v => ({ key: 'color', value: v }))
                        ].map(({ key, value }) => (
                            <span 
                                key={`${key}-${value}`} 
                                className="inline-flex items-center gap-1 md:gap-2 border border-black px-2 md:px-4 py-1 md:py-2 text-[10px] md:text-xs tracking-wider"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                {value}
                                <button
                                    onClick={() => {
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
                                        } else if (key === 'color') {
                                            handleColorFilterChange(value);
                                        }
                                    }}
                                    className="hover:opacity-60"
                                >
                                    <X className="w-2 h-2 md:w-3 md:h-3" />
                                </button>
                            </span>
                        ))}
                        <button
                            onClick={clearAllFilters}
                            className="ml-2 md:ml-4 text-[10px] md:text-xs tracking-wider underline hover:no-underline"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            CLEAR ALL
                        </button>
                    </div>
                </div>
            )}

            {/* Products Count */}
            <div className="w-full px-4 md:px-6 lg:px-8 py-3 md:py-4">
                <div className="max-w-[1800px] mx-auto">
                    <p 
                        className="text-xs md:text-sm tracking-wider"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        {loading ? "Loading..." : `${filteredProducts.length} OF ${totalItems} PRODUCTS`}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6">
                    <div className="max-w-[1800px] mx-auto">
                        <div className="border border-red-300 bg-red-50 p-4 md:p-8">
                            <p 
                                className="text-red-900 mb-2 md:mb-4 tracking-wider text-sm md:text-base"
                                style={{ fontFamily: 'Didot, serif' }}
                            >
                                Error Loading Products
                            </p>
                            <p 
                                className="text-red-700 text-xs md:text-sm mb-4 md:mb-6"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                {error}
                            </p>
                            <button
                                onClick={() => loadProducts(1)}
                                className="px-4 md:px-8 py-2 md:py-3 bg-black text-white text-xs md:text-sm tracking-[0.2em] hover:bg-gray-800 transition"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid */}
{/* Products Grid */}
<div className="w-full px-4 md:px-6 lg:px-8 pb-8 md:pb-16">
    <div className="max-w-[1800px] mx-auto">
        {loading && allProducts.length === 0 ? (
            <div className="flex flex-col md:flex-row items-center justify-center h-64 md:h-96">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                <span 
                    className="ml-0 md:ml-4 mt-4 md:mt-0 text-xs md:text-sm tracking-wider"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                    LOADING PRODUCTS...
                </span>
            </div>
        ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 md:py-24">
                <p 
                    className="text-xl md:text-2xl mb-4 md:mb-6 tracking-wider"
                    style={{ fontFamily: 'Didot, serif' }}
                >
                    No Products Found
                </p>
                {totalActiveFilters > 0 && (
                    <button 
                        onClick={clearAllFilters} 
                        className="text-xs md:text-sm tracking-wider underline hover:no-underline"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        CLEAR ALL FILTERS
                    </button>
                )}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {filteredProducts.map((product) => {
                        const currentImageIndex = productImageIndex[product.id] || 0;
                        const displayImage = hoveredProduct === product.id && product.images.length > 1
                            ? product.images[currentImageIndex]
                            : product.images[0];

                        return (
                            <Link 
                                to={`/${actualGender || 'woman'}/product/${product.sku}`}
                                key={product.sku} 
                                className="group cursor-pointer"
                            >
                                <div 
                                    className="relative aspect-[3/4] bg-gray-50 mb-3 md:mb-4 overflow-hidden"
                                    onMouseEnter={() => setHoveredProduct(product.id)}
                                    onMouseLeave={() => {
                                        setHoveredProduct(null);
                                        setProductImageIndex(prev => ({ ...prev, [product.id]: 0 }));
                                    }}
                                    onTouchStart={() => {
                                        // For mobile touch devices, show navigation immediately
                                        if (product.images.length > 1) {
                                            setHoveredProduct(product.id);
                                        }
                                    }}
                                >
                                    {displayImage ? (
                                        <>
                                            <img
                                                src={displayImage}
                                                alt={product.productName}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            
                                            {/* Image Navigation - All devices */}
                                            {hoveredProduct === product.id && product.images.length > 1 && (
                                                <div className="flex absolute inset-0 items-center justify-between px-2 md:px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <button
                                                        onClick={(e) => prevImage(product.id, e)}
                                                        className="w-8 h-8 md:w-10 md:h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors pointer-events-auto"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => nextImage(product.id, e)}
                                                        className="w-8 h-8 md:w-10 md:h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors pointer-events-auto"
                                                    >
                                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Image Indicators - All devices */}
                                            {product.images.length > 1 && (
                                                <div className="flex absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 gap-1 md:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    {product.images.map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ${
                                                                idx === currentImageIndex ? 'bg-white w-4 md:w-6' : 'bg-white/60'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                    
                                    {!product.inStock && (
                                        <div 
                                            className="absolute top-2 md:top-4 right-2 md:right-4 bg-white px-2 md:px-4 py-1 md:py-2 text-[10px] md:text-xs tracking-[0.2em] pointer-events-none"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >
                                            OUT OF STOCK
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 md:space-y-2 px-1 md:px-2">
                                    <h3 
                                        className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase font-medium"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        {product.name}
                                    </h3>
                                    <p 
                                        className="text-xs md:text-sm leading-relaxed line-clamp-2"
                                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                                    >
                                        {product.productName}
                                    </p>
                                    <div className="pt-1 md:pt-2">
                                        <p 
                                            className="text-xs md:text-sm tracking-wider"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >
                                            {product.minPrice === product.maxPrice 
                                                ? `EUR ${product.minPrice.toFixed(2)}`
                                                : `EUR ${product.minPrice.toFixed(2)} - ${product.maxPrice.toFixed(2)}`
                                            }
                                        </p>
                                    </div>
                                    {product.variantCount > 1 && (
                                        <p 
                                            className="text-[10px] md:text-xs text-gray-600 tracking-wider"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >
                                            {product.variantCount} SIZES AVAILABLE
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 md:mt-16 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className="w-full md:w-auto px-6 md:px-8 py-2 md:py-3 border border-black text-xs tracking-[0.2em] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all duration-300"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Previous
                        </button>
                        
                        <div className="flex gap-1 md:gap-2">
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
                                        className={`w-10 h-10 md:w-12 md:h-12 border text-xs tracking-wider ${
                                            currentPage === pageNum
                                                ? 'bg-black text-white border-black'
                                                : 'border-black hover:bg-black hover:text-white'
                                        } disabled:opacity-30 transition-all duration-300`}
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className="w-full md:w-auto px-6 md:px-8 py-2 md:py-3 border border-black text-xs tracking-[0.2em] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all duration-300"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </>
        )}
    </div>
</div>

            {/* Filters Overlay */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setShowFilters(false)} 
                    />
                    
                    <div className="relative bg-white w-full md:max-w-xl lg:max-w-2xl h-full overflow-y-auto shadow-2xl ml-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 md:px-12 py-6 md:py-8 flex items-center justify-between z-10">
                            <h3 
                                className="text-xl md:text-2xl tracking-[0.2em] md:tracking-[0.3em] font-light"
                                style={{ fontFamily: 'Didot, serif' }}
                            >
                                FILTERS
                            </h3>
                            <button 
                                onClick={() => setShowFilters(false)} 
                                className="p-2 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                        
                        <div className="px-6 md:px-12 py-6 md:py-8">
                            <FilterSection 
                                title="Designers" 
                                filterKey="brand" 
                                options={filterOptions.brands} 
                            />
                            <FilterSection 
                                title="Color" 
                                filterKey="color" 
                                options={filterOptions.colors} 
                            />
                            <FilterSection 
                                title="Type" 
                                filterKey="type" 
                                options={filterOptions.types} 
                            />
                            <FilterSection 
                                title="Category" 
                                filterKey="category" 
                                options={filterOptions.categories} 
                            />
                            
                            <div className="sticky bottom-0 bg-white border-t border-gray-300 mt-8 md:mt-12 py-6 md:py-8 -mx-6 md:-mx-12 px-6 md:px-12">
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <button
                                        onClick={applyApiFilters}
                                        className="py-3 md:py-4 bg-black text-white text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-all duration-300"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={clearAllFilters}
                                        className="py-3 md:py-4 border border-black text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        Clear All
                                    </button>
                                </div>
                                
                                <button
                                    onClick={closeFiltersAndApply}
                                    className="w-full mt-3 md:mt-4 py-3 md:py-4 bg-gray-900 text-white text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-black transition-all duration-300"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    Close & Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;