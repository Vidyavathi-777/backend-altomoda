import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2, Filter, X } from "lucide-react";
import { useParams, Link } from "react-router-dom";

const ProductsPage = () => {
    const { gender = 'woman', newArrival, category, subCategory, brandName, categoryId } = useParams();
    const [openFilters, setOpenFilters] = useState({});
    const [showMore, setShowMore] = useState(false);
    const [sortBy, setSortBy] = useState("Ranking");
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({
        brand: [],
        color: [],
        type: [],
        category: [],
        subcategory: [],
    });

    // Available filter options
    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        colors: [],
        types: [],
        categories: [],
        subcategories: []
    });

    const pageSize = 20;

    const API_TOKEN = "Bearer 55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

    // Fetch categories for filter options
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch products when filters or page changes
    useEffect(() => {
        if (filterOptions.categories.length > 0 || categoryId) {
            setCurrentPage(0);
            fetchProducts(0);
        }
    }, [gender, category, subCategory, brandName, categoryId, selectedFilters, sortBy, filterOptions.categories]);

    useEffect(() => {
        if (currentPage > 0) {
            fetchProducts(currentPage);
        }
    }, [currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/shop/v1/categories/tree`, {
                headers: {
                    'Authorization': API_TOKEN,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Extract categories from tree structure
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

        // Brand filter
        if (selectedFilters.brand?.length > 0) {
            filter.brands = { op: "IN", values: selectedFilters.brand };
        } else if (brandName) {
            filter.brands = { op: "IN", values: [brandName] };
        }

        // Category filter - Category IDs as strings in $oid objects
        const categoryIds = [];

        // First priority: categoryId from URL (direct category ID as string)
        if (categoryId) {
            // Category ID is already a string from URL, wrap it in $oid object
            const idString = categoryId.trim();
            categoryIds.push({ "$oid": idString });
            console.log("Adding categoryId from URL:", idString);
        }

        // Second priority: selected filters
        if (selectedFilters.category?.length > 0) {
            selectedFilters.category.forEach(catName => {
                const categoryObj = filterOptions.categories.find(c => c.name === catName);
                if (categoryObj?.id) {
                    const idString = String(categoryObj.id).trim();
                    if (!categoryIds.some(c => c["$oid"] === idString)) {
                        categoryIds.push({ "$oid": idString });
                        console.log("Adding category from filter:", catName, "->", idString);
                    }
                }
            });
        }

        // Third priority: category from URL path (category name)
        if (category && !categoryId) {
            const urlCategory = filterOptions.categories.find(c =>
                c.name.toLowerCase() === category.toLowerCase()
            );
            if (urlCategory?.id) {
                const idString = String(urlCategory.id).trim();
                if (!categoryIds.some(c => c["$oid"] === idString)) {
                    categoryIds.push({ "$oid": idString });
                    console.log("Adding category from URL path:", category, "->", idString);
                }
            }
        }

        // Only add cat_ids if we have valid IDs
        if (categoryIds.length > 0) {
            filter.cat_ids = { 
                op: "IN", 
                values: categoryIds 
            };
        }

        console.log("=== FINAL FILTER ===");
        console.log("Filter object:", JSON.stringify(filter, null, 2));
        console.log("Category IDs:", categoryIds);
        console.log("==================");
        
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
            
            // Always use the new endpoint with POST request
            const apiUrl = `/api/shop/v2/items/listParentsByFilter?_pageIndex=${pageIndex}&_pageSize=${pageSize}&_sort=${sortExpression}`;
            
            const requestOptions = {
                method: "POST",
                headers: {
                    'Authorization': API_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filter)
            };

            console.log("Fetching products from:", apiUrl);
            console.log("With filter payload:", JSON.stringify(filter, null, 2));

            const response = await fetch(apiUrl, requestOptions);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            
            // Transform API response based on the actual structure
            let transformedProducts = [];
            
            if (data.content && Array.isArray(data.content)) {
                transformedProducts = data.content.flatMap(parent => {
                    // Each parent has an items array with product variants
                    if (parent.items && Array.isArray(parent.items)) {
                        return parent.items.map(item => {
                            // Extract main image (first image with LIST placement)
                            const mainImage = item.imgs?.find(img => 
                                img.placement?.includes("LIST")
                            ) || item.imgs?.[0];
                            
                            // Extract color from locs
                            const color = item.locs?.singles?.color?.en || 
                                        item.locs?.lists?.colors?.[0]?.en || 
                                        item.props?.color || 
                                        '';

                            // Extract title/name
                            const title = item.locs?.singles?.title?.en || 
                                        item.props?.model_name || 
                                        parent.parent_sku || 
                                        'Product';

                            // Extract description
                            const description = item.locs?.singles?.desc?.en || 
                                              item.locs?.singles?.description?.en || 
                                              '';

                            return {
                                id: item.item_id?.$oid || Math.random().toString(),
                                sku: item.sku || parent.parent_sku,
                                name: item.props?.brand || 'Unknown Brand',
                                productName: title,
                                description: description,
                                price: item.stock_price || 0,
                                originalPrice: item.stock_price || 0,
                                discount: 0, // Calculate if there's sale price
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
                                inStock: (item.qty || 0) > 0
                            };
                        });
                    }
                    return [];
                });
            }

            setProducts(transformedProducts);
            setTotalPages(data._metadata?.total_pages || 1);
            setTotalItems(data._metadata?.total_items || transformedProducts.length);

            // Extract unique filter values from products
            extractFilterOptions(transformedProducts);
            
        } catch (error) {
            console.error("Error fetching products:", error);
            setError(error.message || "Failed to fetch products");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

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

    const handleFilterChange = (filterName, value) => {
        setSelectedFilters((prev) => {
            const currentValues = prev[filterName];
            if (currentValues.includes(value)) {
                return {
                    ...prev,
                    [filterName]: currentValues.filter((v) => v !== value),
                };
            } else {
                return {
                    ...prev,
                    [filterName]: [...currentValues, value],
                };
            }
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            brand: [],
            color: [],
            type: [],
            category: [],
            subcategory: [],
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
            id:"561d7300b49dbb9c2c551be1",
            description: "Explore our selection of men’s fashion and lifestyle products, where luxury and style converge with a curated offer from the world’s top brands. Whether you're dressing for a casual day out or a formal event, we have everything you need to complete your look. From tailored Alexander McQueen blazers, iconic leather Gucci belts and crisp Burberry shirts, to graphic t-shirts from Dsquared2 and Lanvin, casual polos by Dolce & Gabbana or even a stylish crossbody bag from Valencia for a trendy yet functional ensemble.Our collection also includes cozy knitwear and smart swimwear, ensuring you're prepared for any season or occasion. Elevate your daily routine with premium skincare products, elegant home décor, and stylish stationery, bringing a touch of luxury to every aspect of your life. Experience unmatched quality and craftsmanship with our range of clothing, accessories, and lifestyle products, designed to make every day a stylish one."
        },
        {
            gender: "woman",
            id:"561d7300b49dbb9c2c551c29",
            description: "Our offer of women's designer clothing, shoes and accessories is a true expression of style and elegance, featuring a mesmerizing array of colors, textures, and designs. Each piece is crafted with the utmost care and attention to detail, using the finest materials to create truly one-of-a-kind designs. Explore fashion-forward pieces from legendary fashion houses Balenciaga, Gucci opt for something edgier from contemporary labels born in the 21st century.Our collection of womenswear is a fusion of modern designs and timeless sophistication that flatters the female form and celebrates individuality. Whether you opt for a sleek, body-con dress or a pair of bootcut jeans, women's designer clothing is a testament to the transformative power of fashion and an invitation to embrace your personal style. The ultimate indulgence, designer accessories and shoes are the perfect finishing touch for a special event or to simply elevate your everyday look. A beautiful way to make a statement and feel confident and stylish, our selection of women’s designer apparel and accessories has something for every mood."
        }
    ];

    // Get the gender using the categoryId
const currentGender = description.find(item => item.id === categoryId)?.gender || gender;
const filterDescription = description.find(item => item.id === categoryId)?.description || "";


    const activeFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

    const FilterSection = ({ title, filterKey, options }) => {
        const displayOptions = Array.isArray(options) ? 
            (options[0]?.name ? options.map(o => o.name) : options) : 
            [];

        return (
            <div className="border-b border-gray-200">
                <button
                    onClick={() => toggleFilter(filterKey)}
                    className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                >
                    <span className="text-sm uppercase tracking-wider font-medium">
                        {title}
                    </span>
                    {openFilters[filterKey] ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
                {openFilters[filterKey] && (
                    <div className="pb-4 space-y-2 max-h-60 overflow-y-auto">
                        {displayOptions.length > 0 ? (
                            displayOptions.map((option) => {
                                const count = products.filter(p => {
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
                                            checked={selectedFilters[filterKey].includes(option)}
                                            onChange={() => handleFilterChange(filterKey, option)}
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
        <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-light mb-4 uppercase">{currentGender}</h1>
                    <div className="text-sm text-gray-700 leading-relaxed">
                        <p className={`${!showMore ? "line-clamp-3" : ""}`}>
                            {filterDescription}
                        </p>
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="text-black underline mt-2 text-sm hover:no-underline"
                        >
                            {showMore ? "show less" : "show more"}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                        <button
                            onClick={() => fetchProducts(0)}
                            className="mt-2 text-red-600 text-sm underline hover:no-underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Results Count and Sort */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-4">
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        
                        <div className="text-sm text-gray-600">
                            {loading ? "Loading..." : `${products.length} of ${totalItems} products`}
                        </div>
                        
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs underline hover:no-underline text-gray-600"
                            >
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

                {/* Active Filters Pills */}
                {activeFilterCount > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {Object.entries(selectedFilters).map(([key, values]) =>
                            values.map(value => (
                                <span
                                    key={`${key}-${value}`}
                                    className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 text-xs rounded-full"
                                >
                                    {value}
                                    <button
                                        onClick={() => handleFilterChange(key, value)}
                                        className="hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))
                        )}
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Desktop Filters Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="space-y-0 sticky top-24">
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
                            <FilterSection 
                                title="Subcategory" 
                                filterKey="subcategory" 
                                options={filterOptions.subcategories} 
                            />
                        </div>
                    </aside>

                    {/* Mobile Filters Overlay */}
                    {showMobileFilters && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-black bg-opacity-50"
                                onClick={() => setShowMobileFilters(false)}
                            />
                            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Filters</h3>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="p-2 hover:bg-gray-100 rounded"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
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
                                    <FilterSection 
                                        title="Subcategory" 
                                        filterKey="subcategory" 
                                        options={filterOptions.subcategories} 
                                    />
                                    
                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="w-full bg-black text-white py-3 rounded text-sm uppercase tracking-wider"
                                        >
                                            Apply Filters
                                        </button>
                                        <button
                                            onClick={clearAllFilters}
                                            className="w-full border border-gray-300 py-3 rounded text-sm uppercase tracking-wider"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading && products.length === 0 ? (
                            <div className="flex items-center justify-center h-96">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg mb-4">No products found</p>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm underline hover:no-underline"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8">
                                    {products.map((product) => (
                                        <Link
                                            to={`/${gender}/product/${product.id}`}
                                            key={product.id}
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
                                                {product.discount > 0 && (
                                                    <div className="absolute top-2 left-2 bg-white px-2 py-1 text-xs uppercase tracking-wider">
                                                        -{product.discount}%
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
                                                <p className="text-sm text-gray-600 line-clamp-2">{product.productName}</p>
                                                {product.color && (
                                                    <p className="text-xs text-gray-500 capitalize">{product.color}</p>
                                                )}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <p className="text-base font-semibold">
                                                        ${product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
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