import React, { useState, useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { fetchSearchProducts, transformProduct } from "../../src/api/productsApi";

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchQuery = searchParams.get('q') || '';
    
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [scrollPositions, setScrollPositions] = useState({});
    
    const scrollRefs = useRef({});
    const pageSize = 30;

    // Reset when search query changes
    useEffect(() => {
        if (!searchQuery) {
            navigate('/search');
            return;
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(1);
        setScrollPositions({});
        loadProducts(1);
    }, [searchQuery]);

    // Load more pages
    useEffect(() => {
        if (currentPage > 1) {
            loadProducts(currentPage);
        }
    }, [currentPage]);

    const loadProducts = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await fetchSearchProducts(searchQuery, page, pageSize);

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

    const clearSearch = () => {
        navigate('/search');
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
            `}</style>

            {/* Header Section */}
            <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16 border-b border-gray-200">
                <div className="max-w-[1800px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6 md:mb-8">
                        <div className="flex-1">
                            <h1 
                                className="text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-4 tracking-wider font-light"
                                style={{ fontFamily: 'Didot, serif' }}
                            >
                                Search Results
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 
                                    className="text-lg md:text-xl lg:text-2xl tracking-[0.2em] md:tracking-[0.3em] font-light text-gray-700"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    "{searchQuery}"
                                </h2>
                                <button
                                    onClick={clearSearch}
                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    <X className="w-4 h-4" />
                                    <span>Clear Search</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Count */}
            <div className="w-full px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200">
                <div className="max-w-[1800px] mx-auto">
                    <p 
                        className="text-xs md:text-sm tracking-wider"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        {loading ? "Loading..." : `${allProducts.length} PRODUCTS FOUND`}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 md:px-6 lg:px-8 pb-8 md:pb-16">
                <div className="max-w-[1800px] mx-auto">
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
                                SEARCHING PRODUCTS...
                            </span>
                        </div>
                    ) : allProducts.length === 0 ? (
                        <div className="text-center py-16 md:py-24">
                            <p 
                                className="text-xl md:text-2xl mb-4 md:mb-6 tracking-wider"
                                style={{ fontFamily: 'Didot, serif' }}
                            >
                                No Products Found
                            </p>
                            <p 
                                className="text-sm md:text-base text-gray-600 mb-6"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                Try searching with different keywords
                            </p>
                            <button 
                                onClick={clearSearch} 
                                className="px-6 py-3 border border-black text-xs tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                NEW SEARCH
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-8">
                                {allProducts.map((product) => {
                                    const scrollPosition = scrollPositions[product.id] || 0;
                                    const scrollContainer = scrollRefs.current[product.id];
                                    const imageWidth = scrollContainer ? scrollContainer.offsetWidth : 0;
                                    const currentImageIndex = imageWidth > 0 ? Math.round(scrollPosition / imageWidth) : 0;

                                    return (
                                        <Link 
                                            to={`/woman/product/${product.sku}`}
                                            key={product.sku} 
                                            className="group cursor-pointer"
                                        >
                                            <div 
                                                className="relative aspect-[3/4] bg-gray-50 mb-3 md:mb-4 overflow-hidden"
                                                onMouseEnter={() => setHoveredProduct(product.id)}
                                                onMouseLeave={() => setHoveredProduct(null)}
                                            >
                                                {/* Horizontal Image Scroller */}
                                                {product.images.length > 0 ? (
                                                    <div 
                                                        ref={el => scrollRefs.current[product.id] = el}
                                                        className="w-full h-full flex overflow-x-auto image-scroll-container snap-x snap-mandatory scroll-smooth"
                                                        onScroll={() => handleScroll(product.id)}
                                                    >
                                                        {product.images.map((image, index) => (
                                                            <div 
                                                                key={index}
                                                                className="w-full h-full flex-shrink-0 snap-start"
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

                                                {/* Scroll Indicators */}
                                                {product.images.length > 1 && (
                                                    <div className="absolute bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 pointer-events-none">
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
        </div>
    );
};

export default SearchResultsPage;