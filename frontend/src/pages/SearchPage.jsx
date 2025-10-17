// SearchPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // Fixed import

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate(); // Moved here from handleProductClick

    // Mock popular search terms and brands for suggestions
    const popularTerms = [
        'Gucci', 'Prada', 'Louis Vuitton', 'Chanel', 'Dior',
        'handbags', 'shoes', 'watches', 'jewelry', 'accessories',
        'men\'s clothing', 'women\'s dresses', 'sunglasses', 'perfume'
    ];
    const API_TOKEN = "Bearer 55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

    // Debounced search function
const debouncedSearch = useCallback(
    debounce(async (term) => {
        if (term.length < 2) {
            setProducts([]);
            return;
        }

        setLoading(true);

        try {
            // Fetch products from backend (no filtering)
            const response = await fetch(
                `https://backend-altomoda.vercel.app/api/products/search?term=${encodeURIComponent(term)}`
            );

            if (response.ok) {
                const data = await response.json();
                setProducts(data.products.content || []);
            } else {
                console.error('Failed to fetch products');
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, 300),
    []
);


    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm, debouncedSearch]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(value.length > 0);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setProducts([]);
        setShowSuggestions(false);
    };

    const handleProductClick = (product) => {
        // Redirect to product detail page
        console.log('Redirecting to product:', product);
        navigate(`/product/${product.item_id.$oid}`); // Fixed: use item_id.$oid
    };

    return (
        <div className="min-h-screen bg-gray-50 sm:pt-[140px] md:pt-[160px] lg:pt-[200px]">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Search for brands, products, categories..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Search Suggestions */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        <span className="text-gray-800">{suggestion}</span>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                ) : searchTerm ? (
                    <>
                        {/* Search Results Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Search Results for "{searchTerm}"
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Found {products.length} products
                            </p>
                        </div>

                        {/* Products Grid */}
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.item_id.$oid}
                                        product={product}
                                        onClick={handleProductClick}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600">
                                    Try adjusting your search terms or browse different categories.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    /* Popular Searches */
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            Popular Searches
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {popularTerms.map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(term)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Product Card Component - FIXED VERSION
const ProductCard = ({ product, onClick }) => {
    const { locs, props, stock_price, imgs, item_id } = product;
    const title = locs?.singles?.title?.en || 'Product Title';
    const color = locs?.singles?.color?.en || 'Various';
    const brand = props?.brand || 'Unknown Brand';
    const price = stock_price || 0;
    const productId = item_id?.$oid; // Get the product ID

    const handleClick = () => {
        onClick(product);
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            onClick={handleClick} // Added click handler to the entire card
        >
            <Link to={`/product/${productId}`} className="block"> {/* Fixed Link wrapper */}
                <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {imgs?.[0]?.url ? (
                        <img
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            src={imgs[0].url} // Fixed: use imgs directly, not product.imgs
                            alt={title} // Fixed: use title, not product.name
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-400 text-center p-4">
                            <div className="text-2xl mb-2">👜</div>
                            <p className="text-sm">Product Image</p>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-black">
                            {title}
                        </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">{brand}</p>

                    <div className="flex items-center justify-between mt-3">
                        <div>
                            <span className="text-lg font-bold text-gray-900">
                                Eur {price}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                            <p>{color}</p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

// Alternative Product Card Component (if you prefer the entire card to be clickable via Link)
const ProductCardAlternative = ({ product, onClick }) => {
    const { locs, props, stock_price, imgs, item_id } = product;
    const title = locs?.singles?.title?.en || 'Product Title';
    const color = locs?.singles?.color?.en || 'Various';
    const brand = props?.brand || 'Unknown Brand';
    const price = stock_price || 0;
    const productId = item_id?.$oid;

    return (
        <Link 
            to={`/product/${productId}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group block"
        >
            <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                {imgs?.[0]?.url ? (
                    <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={imgs[0].url}
                        alt={title}
                        loading="lazy"
                    />
                ) : (
                    <div className="text-gray-400 text-center p-4">
                        <div className="text-2xl mb-2">👜</div>
                        <p className="text-sm">Product Image</p>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-black">
                        {title}
                    </h3>
                </div>

                <p className="text-sm text-gray-600 mb-1">{brand}</p>

                <div className="flex items-center justify-between mt-3">
                    <div>
                        <span className="text-lg font-bold text-gray-900">
                            Eur {price}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                        <p>{color}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default SearchPage;