import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const NewArrivals = () => {
  const { gender = 'woman' } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  // Fetch new arrival products from API
  const fetchNewArrivals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/new?page=1&limit=20`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.products)) {
        // Transform the API response to match your component's expected format
        const transformedProducts = data.data.products.map((product) => {
          const mainImage = product.images?.[0] || null;
          
          // Get localized title (default to English)
          const title = product.title?.en || 
                       product.title?.it || 
                       product.title?.zh || 
                       Object.values(product.title || {})[0] || 
                       'Product';

          // Get localized category
          const category = product.category?.en || 
                          product.category?.it || 
                          Object.values(product.category || {})[0] || 
                          'Clothing';

          return {
            _id: { $oid: product._id || Math.random().toString() },
            name: product.brand || 'Unknown Brand',
            title: title,
            description: product.description?.en || '',
            price: {
              amount: product.base_price || 0,
              currency: 'EUR' // Changed from USD to EUR based on your product data
            },
            imgs: mainImage ? [{ url: mainImage.url }] : [],
            brand: product.brand || 'Unknown',
            category: category,
            subcategory: '',
            color: product.color?.en || product.color?.it || Object.values(product.color || {})[0] || '',
            type: '',
            gender: product.sex?.en || gender,
            size: product.variants?.[0]?.size || '',
            madeIn: product.made?.en || '',
            composition: product.composition || [],
            qty: product.variants?.[0]?.stock || 0,
            inStock: (product.variants?.[0]?.stock || 0) > 0,
            lastUpdated: new Date().toISOString(),
            link: `/${gender}/product/${product.sku_parent}` // Using sku_parent instead of _id
          };
        });

        // Take only first 10 products for slider
        const limitedProducts = transformedProducts.slice(0, 10);
        setProducts(limitedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError(error.message || "Failed to fetch new arrivals");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
  }, [gender]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setCurrentSlide(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setCurrentSlide(prev => Math.min(products.length - 1, prev + 1));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="home-page-section bg-white py-12 md:py-16 lg:py-20">
        <div className="max-w-8xl mx-auto px-4">
          {/* Header Section */}
          <div className="slider-products-border border-b border-gray-200 mb-8">
            <div className="slider-products-card-container mb-8">
              <div className="card-text">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-gray-900">
                  NEW ARRIVALS // SHOP NOW
                </h3>
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          <div className="flex space-x-4 md:space-x-6 lg:space-x-8 pb-4 overflow-hidden">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-48 md:w-56 lg:w-64">
                <div className="product-card-container bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="product-card relative overflow-hidden">
                    <div className="w-full overflow-hidden relative pt-[150%]">
                      <div className="absolute inset-0">
                        <div className="skeleton-animated-background w-full h-full bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                  <div className="product-info p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="home-page-section bg-white py-12 md:py-16 lg:py-20">
        <div className="max-w-8xl mx-auto px-4">
          <div className="slider-products-border border-b border-gray-200 mb-8">
            <div className="slider-products-card-container mb-8">
              <div className="card-text">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-gray-900">
                  NEW ARRIVALS // SHOP NOW
                </h3>
              </div>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Error loading new arrivals</p>
            <button
              onClick={fetchNewArrivals}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-section bg-white py-12 md:py-16 lg:py-20">
      <div className="max-w-8xl mx-auto px-4">

        {/* Header Section */}
        <div className="slider-products-border border-b border-gray-200 mb-8">
          <div className="slider-products-card-container mb-8">
            <div className="card-text">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-gray-900">
                NEW ARRIVALS // SHOP NOW
              </h3>
            </div>
          </div>
        </div>

        {/* Slider Container */}
        <div className="slider-products-container relative">

          {/* Navigation Buttons - Only show if there are products */}
          {products.length > 0 && (
            <>
              <button
                onClick={scrollLeft}
                disabled={currentSlide === 0}
                className={`slider-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                  }`}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={scrollRight}
                disabled={currentSlide === products.length - 1}
                className={`slider-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 ${currentSlide === products.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                  }`}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Products Slider */}
          <div
            ref={sliderRef}
            className="slider-products overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-4 md:space-x-6 lg:space-x-8 pb-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <Link
                    key={product._id.$oid}
                    className="flex-shrink-0 w-48 md:w-56 lg:w-64 group"
                    to={product.link}
                  >
                    {/* Product Card */}
                    <div className="product-card-container bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">

                      {/* Product Image */}
                      <div className="product-card relative overflow-hidden">
                        <div className="block">
                          <div className="product-card-image relative">
                            <div className="w-full overflow-hidden relative pt-[150%]">
                              <div className="absolute inset-0">
                                <div className="image-wrapper relative w-full h-full">
                                  {product.imgs[0] ? (
                                    <img
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      src={product.imgs[0].url}
                                      alt={product.name}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                      No Image
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="product-info p-4">
                        <div className="product-info-wrapper space-y-2">

                          {/* Brand */}
                          <div className="product-vendor">
                            <h2 className="vendor-title text-xs uppercase tracking-wider text-gray-500 font-medium">
                              {product.brand}
                            </h2>
                          </div>

                          {/* Product Name */}
                          <div className="product-title">
                            <h3 className="product-description text-sm font-medium text-gray-900 leading-tight line-clamp-2 hover:text-gray-700 transition-colors">
                              {product.title}
                            </h3>
                          </div>

                          {/* Price */}
                          <div className="product-price-data">
                            <div className="price-compare-container">
                              <div className="price-height">
                                <span className="price-sale">
                                  <div className="price-format left-currency">
                                    <span className="simbol text-gray-900 font-semibold">{product.price.currency}</span>
                                    <span className="text-gray-900 font-semibold ml-1">
                                      {formatPrice(product.price.amount)}
                                    </span>
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Category Badge */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {product.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              New
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full text-center py-12">
                  <p className="text-gray-500 text-lg">No new arrivals found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .skeleton-animated-background {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NewArrivals;