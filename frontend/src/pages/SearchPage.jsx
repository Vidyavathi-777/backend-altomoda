// SearchPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Popular search terms for initial display
    const popularTerms = [
        'Gucci', 'Prada', 'Louis Vuitton', 'Chanel', 'Dior',
        'handbags', 'shoes', 'watches', 'jewelry', 'accessories',
        'men\'s clothing', 'women\'s dresses', 'sunglasses'
    ];

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    }, []);

    // Debounced search for suggestions
    const debouncedFetchSuggestions = useCallback(
        debounce(async (term) => {
            if (term.length < 2) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                // Fetch quick suggestions from backend
                const response = await fetch(
                    `${API_BASE_URL}/products/search?search=${encodeURIComponent(term)}&limit=5`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data.products) {
                        // Extract unique suggestions from products
                        const uniqueSuggestions = new Set();
                        
                        data.data.products.forEach(product => {
                            // Add brand
                            if (product.brand) uniqueSuggestions.add(product.brand);
                            // Add title
                            if (product.title?.en) uniqueSuggestions.add(product.title.en);
                            // Add category
                            if (product.category?.en) uniqueSuggestions.add(product.category.en);
                        });

                        setSuggestions(Array.from(uniqueSuggestions).slice(0, 8));
                    }
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedFetchSuggestions(searchTerm);
    }, [searchTerm, debouncedFetchSuggestions]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(value.length > 0);
    };

    const handleSearch = (term) => {
        if (!term || term.trim().length === 0) return;

        // Save to recent searches
        saveRecentSearch(term);

        // Navigate to products page with search query
        navigate(`/products/search?q=${encodeURIComponent(term)}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(searchTerm);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const saveRecentSearch = (term) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearch = (term) => {
        const updated = recentSearches.filter(s => s !== term);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearAllRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 sm:pt-[140px] md:pt-[160px] lg:pt-[200px]">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base"
                                placeholder="Search for brands, products, categories..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                                autoFocus
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

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-20 w-full max-w-2xl mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <div className="py-2">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Search className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-800">{suggestion}</span>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Recent Searches
                                </h2>
                                <button
                                    onClick={clearAllRecentSearches}
                                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term, index) => (
                                    <div
                                        key={index}
                                        className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <button
                                            onClick={() => handleSearch(term)}
                                            className="text-sm text-gray-700"
                                        >
                                            {term}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearRecentSearch(term);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular Searches */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Popular Searches
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {popularTerms.map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(term)}
                                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Tips */}
                    <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Search Tips</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                            <li>• Try searching by brand name (e.g., "Gucci", "Prada")</li>
                            <li>• Search by product type (e.g., "handbags", "shoes")</li>
                            <li>• Use category names (e.g., "dresses", "accessories")</li>
                            <li>• Search by color (e.g., "black dress", "red shoes")</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
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