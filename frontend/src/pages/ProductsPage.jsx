import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, Loader2, Filter, X } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    fetchBrands,
    fetchCategoryChildren,
    fetchProductsByCategory,
    fetchProductsByBrand,
    fetchProductsWithFilters,
    fetchNewArrivalsByCategory,
    transformProduct
} from "../../src/api/productsApi";
import Breadcrumb from "../components/BreadCrumb";
import tryLook from '../assets/tryTheLook.png'
import TryOnModal from '../components/Tryon';

const ProductsPage = () => {
    const navigate = useNavigate()


    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
    const [isNewArrivalMode, setIsNewArrivalMode] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [scrollPositions, setScrollPositions] = useState({});
    const [showTryOn, setShowTryOn] = useState(false);
    const [selectedProductForTryOn, setSelectedProductForTryOn] = useState(null);

    const [clientFilters, setClientFilters] = useState({ color: [] });
    const [apiFilters, setApiFilters] = useState({ brand: [], category: [], type: [] });
    const [tempApiFilters, setTempApiFilters] = useState({ brand: [], category: [], type: [] });
    const [filterOptions, setFilterOptions] = useState({ brands: [], colors: [], types: [], categories: [] });
    const [openFilterSections, setOpenFilterSections] = useState({
        brand: false,
        color: false,
        type: false,
        category: false
    });

    const scrollRefs = useRef({});

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
        setSortBy('');
        setScrollPositions({});
    }, [actualGender, actualCategoryId, actualBrandName, actualNewArrival]);

    const getBaseCategoryId = () => {
        if (actualGender && !actualCategoryId) {
            return actualGender === 'man' ? '68f86b10734810ab97bb98d1' : '68f86b1c734810ab97bb9a2f';
        }
        return null;
    };


    const handleTryOnClick = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProductForTryOn(product); // Set the selected product
        setShowTryOn(true);
    };

    // Update the modal close handler to clear the selected product
    const handleTryOnClose = () => {
        setShowTryOn(false);
        setSelectedProductForTryOn(null); // Clear the selected product
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

    // ProductsPage.jsx - Update the loadProducts function and effects

    // Add sortBy to dependencies and update loadProducts function
    useEffect(() => {
        setCurrentPage(1);
        loadProducts(1);
    }, [actualCategoryId, actualBrandName, actualNewArrival, apiFilters, sortBy]); // Added sortBy

    useEffect(() => {
        if (currentPage > 1) {
            loadProducts(currentPage);
        }
    }, [currentPage, sortBy]); // Added sortBy

    const loadProducts = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            let result;

            const hasActiveApiFilters = apiFilters.brand.length > 0 ||
                apiFilters.category.length > 0 ||
                apiFilters.type.length > 0;

            // Use empty string for no sorting
            const effectiveSortBy = sortBy; // Keep as empty string for no sorting

            if (hasActiveApiFilters || isNewArrivalMode) {
                const filterPayload = buildFilterPayload();
                result = await fetchProductsWithFilters(filterPayload, page, pageSize, effectiveSortBy);
            } else if (actualCategoryId && actualBrandName) {
                result = await fetchProductsByBrand(actualBrandName, actualCategoryId, page, pageSize, effectiveSortBy);
            } else if (actualCategoryId) {
                result = await fetchProductsByCategory(actualCategoryId, page, pageSize, effectiveSortBy);
            } else if (actualNewArrival) {
                result = await fetchNewArrivalsByCategory(actualNewArrival, page, pageSize, effectiveSortBy);
            } else {
                const baseCategoryId = getBaseCategoryId();
                if (baseCategoryId) {
                    result = await fetchProductsByCategory(baseCategoryId, page, pageSize, effectiveSortBy);
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

    // Update buildFilterPayload to include sortBy
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

        // if (actualCategoryId || actualNewArrival) {
        //     const baseCatId = actualCategoryId || actualNewArrival;
        //     if (!categoryIds.includes(baseCatId)) {
        //         categoryIds.push(baseCatId);
        //     }
        // }

        if (categoryIds.length > 0) {
            payload.categoryIds = categoryIds;
        }

        const brands = [];

        // if (actualBrandName) {
        //     brands.push(actualBrandName);
        // }

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

        // Add sortBy to payload for filtered requests
        payload.sortBy = sortBy;

        return payload;
    };

    // Update the sortProducts function to handle all cases
    const sortProducts = (products) => {
        const sorted = [...products];

        switch (sortBy) {
            case 'newest':
                // Products are already sorted by newest from the API
                return sorted;
            case 'price-low':
                return sorted.sort((a, b) => a.minPrice - b.minPrice);
            case 'price-high':
                return sorted.sort((a, b) => b.minPrice - a.minPrice);
            case 'a-z':
                return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
            case 'z-a':
                return sorted.sort((a, b) => b.productName.localeCompare(a.productName));
            default:
                return sorted;
        }
    };

    // Update the filteredProducts useMemo
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        if (clientFilters.color.length > 0) {
            filtered = filtered.filter(p =>
                clientFilters.color.some(color =>
                    p.color?.toLowerCase().includes(color.toLowerCase())
                )
            );
        }

        return sortProducts(filtered);
    }, [allProducts, clientFilters.color, sortBy]);

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
        setShowFilters(false);
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

    const handleScroll = (productId) => {
        const scrollContainer = scrollRefs.current[productId];
        if (scrollContainer) {
            setScrollPositions(prev => ({
                ...prev,
                [productId]: scrollContainer.scrollLeft
            }));
        }
    };

    const toggleFilterSection = (key) => {
        setOpenFilterSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const description = [
        {
            gender: "man",
            id: "68f86b10734810ab97bb98d1",
            description: "Explore our selection of men's fashion and lifestyle products, where luxury and style converge with a curated offer from the world's top brands. Whether you're dressing for a casual day out or a formal event, we have everything you need to complete your look. From tailored Alexander McQueen blazers, iconic leather Gucci belts and crisp Burberry shirts, to graphic t-shirts from Dsquared2 and Lanvin, casual polos by Dolce & Gabbana or even a stylish crossbody bag from Valencia for a trendy yet functional ensemble.Our collection also includes cozy knitwear and smart swimwear, ensuring you're prepared for any season or occasion. Elevate your daily routine with premium skincare products, elegant home décor, and stylish stationery, bringing a touch of luxury to every aspect of your life. Experience unmatched quality and craftsmanship with our range of clothing, accessories, and lifestyle products, designed to make every day a stylish one."
        },
        {
            gender: "woman",
            id: "68f86b1c734810ab97bb9a2f",
            description: "Our offer of women's designer clothing, shoes and accessories is a true expression of style and elegance, featuring a mesmerizing array of colors, textures, and designs. Each piece is crafted with the utmost care and attention to detail, using the finest materials to create truly one-of-a-kind designs. Explore fashion-forward pieces from legendary fashion houses Balenciaga, Gucci opt for something edgier from contemporary labels born in the 21st century.Our collection of womenswear is a fusion of modern designs and timeless sophistication that flatters the female form and celebrates individuality. Whether you opt for a sleek, body-con dress or a pair of bootcut jeans, women's designer clothing is a testament to the transformative power of fashion and an invitation to embrace your personal style. The ultimate indulgence, designer accessories and shoes are the perfect finishing touch for a special event or to simply elevate your everyday look. A beautiful way to make a statement and feel confident and stylish, our selection of women's designer apparel and accessories has something for every mood."
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

    const FilterSection = ({ title, filterKey, options }) => {
        const isOpen = openFilterSections[filterKey];

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
                    onClick={() => toggleFilterSection(filterKey)}
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

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .image-scroll-container {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .image-scroll-container::-webkit-scrollbar {
                    display: none;
                }

                .scroll-indicators {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .scroll-indicators::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Header Section */}
            <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16 border-b border-gray-200">
                {/* <Breadcrumb /> */}
              <p
    className="cursor-pointer text-gray-700 hover:underline"
    onClick={() => navigate("/")}
>
    Back
</p>

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
                            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 border border-black hover:bg-black hover:text-white transition-all duration-300 w-full md:w-auto justify-center lg:hidden"
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
                            className="text-sm md:text-base leading-relaxed "
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


            {/* Products Count and Sort */}
            <div className="w-full px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                    <p
                        className="text-xs md:text-sm tracking-wider"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        {loading ? "Loading..." : `${filteredProducts.length} OF ${totalItems} PRODUCTS`}
                    </p>

                    {/* Updated select with proper "no sorting" option */}
                    <div className="relative w-full md:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-64 px-4 py-2 md:py-3 border border-black bg-white text-xs tracking-wider appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            <option value="">SORT BY</option>
                            <option value="newest">NEW ARRIVALS</option>
                            <option value="price-low">PRICE: LOW TO HIGH</option>
                            <option value="price-high">PRICE: HIGH TO LOW</option>
                            <option value="a-z">NAME: A-Z</option>
                            <option value="z-a">NAME: Z-A</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Main Content - Desktop Filters + Products */}
            <div className="w-full px-4 md:px-6 lg:px-8 pb-8 md:pb-16">
                <div className="max-w-[1800px] mx-auto">
                    <div className="flex gap-8">
                        {/* Desktop Filters Sidebar */}
                        <div className="hidden lg:block w-80 flex-shrink-0">

                            {/* Entire sidebar uses flex to lock footer buttons */}
                            <div className="sticky top-32 h-[85vh] flex flex-col justify-between bg-white">

                                {/* Scrollable filter area */}
                                <div className="overflow-y-auto pr-2">

                                    <h3
                                        className="text-xl tracking-[0.2em] font-light mb-6 pb-4 border-b border-gray-300"
                                        style={{ fontFamily: 'Didot, serif' }}
                                    >
                                        FILTERS
                                    </h3>

                                    <FilterSection title="Designers" filterKey="brand" options={filterOptions.brands} />
                                    <FilterSection title="Color" filterKey="color" options={filterOptions.colors} />
                                    <FilterSection title="Type" filterKey="type" options={filterOptions.types} />
                                    <FilterSection title="Category" filterKey="category" options={filterOptions.categories} />
                                </div>

                                {/* FIXED ALWAYS VISIBLE BUTTONS */}
                                <div className="border-t border-gray-300 pt-4 pb-6 bg-white flex flex-col gap-3">

                                    <button
                                        onClick={applyApiFilters}
                                        className="w-full py-3 bg-black text-white text-xs tracking-[0.2em] uppercase hover:bg-gray-800 transition-all duration-300"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        Apply Filters
                                    </button>

                                    {totalActiveFilters > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="w-full py-3 border border-black text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Products Area */}
                        <div className="flex-1 min-w-0">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6">
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
                            )}

                            {/* Products Grid */}
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
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 ">
                                        {filteredProducts.map((product) => {
                                            const scrollPosition = scrollPositions[product.id] || 0;
                                            const scrollContainer = scrollRefs.current[product.id];
                                            const imageWidth = scrollContainer ? scrollContainer.offsetWidth : 0;
                                            const currentImageIndex = imageWidth > 0 ? Math.round(scrollPosition / imageWidth) : 0;

                                            return (
                                                <Link
                                                    to={`/${actualGender || 'woman'}/product/${product.sku}`}
                                                    key={product.sku}
                                                    className="group cursor-pointer pt-[50px]"
                                                >
                                                    <div
                                                        className="relative aspect-[3/4] bg-gray-50 mb-4  md:mb-4 overflow-hidden "
                                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                                        onMouseLeave={() => setHoveredProduct(null)}
                                                    >
                                                        {/* Horizontal Image Scroller */}
                                                        {product.images.length > 0 ? (
                                                            <div
                                                                ref={el => scrollRefs.current[product.id] = el}
                                                                className="w-full h-full flex overflow-x-auto image-scroll-container snap-x snap-mandatory scroll-smooth "
                                                                onScroll={() => handleScroll(product.id)}
                                                            >
                                                                {product.images.map((image, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="w-full h-full flex-shrink-0 snap-start "
                                                                    >
                                                                        <img
                                                                            src={image}
                                                                            alt={`${product.productName} - Image ${index + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                            loading="lazy"
                                                                            onError={(e) => {
                                                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                                                No Image
                                                            </div>
                                                        )}

                                                        {/* Top Right - Try On Button */}
                                                        <div className="absolute top-2 left-3 right-3 flex justify-between items-start z-10">

                                                            {(isNewArrivalMode || product.isNewArrival) && (
                                                                <div
                                                                    className="bg-black text-white px-2 lg:px-3 py-1 text-xs tracking-[0.2em]"
                                                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                                                >
                                                                    NEW
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={(e) => handleTryOnClick(e, product)}
                                                                className="bg-black border  
                   px-2 lg:px-3 py-1
                   transition-all duration-200 shadow-sm hover:shadow-md
                   flex items-center gap-1"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 64 64"
                                                                    className="w-3.5 h-3.5 text-white"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="3"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M32 6c-2.5 0-4.5 2-4.5 4.5" />
                                                                    <path d="M27.5 10.5C27.5 13.985 30.515 17 34 17c3.485 0 6.5-3.015 6.5-6.5" />
                                                                    <path d="M8 34s10-9 24-9 24 9 24 9" />
                                                                    <path d="M10.5 36.5s9-7 21.5-7 21.5 7 21.5 7" />
                                                                </svg>

                                                                <span
                                                                    className="text-xs tracking-[0.2em] text-white"
                                                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                                                >
                                                                    TRY
                                                                </span>
                                                            </button>

                                                        </div>

                                                        {/* Scroll Indicators */}
                                                        {product.images.length > 1 && (
                                                            <div className="absolute bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 pointer-events-none">
                                                                {product.images.map((_, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4 md:w-6' : 'bg-white/60'
                                                                            }`}
                                                                    />
                                                                ))}
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
                                                        <div className="flex items-center justify-between gap-3">
                                                            {/* Price */}
                                                            <div className="pt-1 md:pt-2">
                                                                <p
                                                                    className="text-xs md:text-sm tracking-wider"
                                                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                                                >
                                                                    {product.minPrice === product.maxPrice
                                                                        ? `RS ${product.minPrice.toLocaleString('en-IN')}`
                                                                        : `RS ${product.minPrice.toLocaleString('en-IN')} - ${product.maxPrice.toLocaleString('en-IN')}`
                                                                    }
                                                                </p>
                                                            </div>
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
                                                            className={`w-10 h-10 md:w-12 md:h-12 border text-xs tracking-wider ${currentPage === pageNum
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
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowFilters(false)}
                    />

                    <div className="relative bg-white w-full md:max-w-xl h-full overflow-y-auto shadow-2xl ml-auto">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <TryOnModal
                open={showTryOn}
                onClose={handleTryOnClose}
                productImage={selectedProductForTryOn?.images?.[0]} // Use the selected product's first image

            />
        </div>
    );
};

export default ProductsPage;