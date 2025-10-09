import React, { useState, useRef, useEffect } from 'react';
import productsData from "../../json/productsData.json"
import { Link, useParams } from 'react-router-dom';

const NewArrivals = () => {
   const {gender = 'woman'} = useParams()
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef(null);
  const {  products } = productsData.productSlider;
  const filteredProducts = productsData.productSlider.products.filter(item => item.gender === gender && item.title === "newarrival" )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
          
          {/* Navigation Buttons */}
          <button
            onClick={scrollLeft}
            disabled={currentSlide === 0}
            className={`slider-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 ${
              currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={scrollRight}
            disabled={currentSlide === products.length - 1}
            className={`slider-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 ${
              currentSlide === products.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Products Slider */}
          <div
            ref={sliderRef}
            className="slider-products overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-4 md:space-x-6 lg:space-x-8 pb-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  className="flex-shrink-0 w-48 md:w-56 lg:w-64 group"
                  to={`/${gender}/product/${product.id}`}
                >
                  {/* Product Card */}
                  <div className="product-card-container bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                    
                    {/* Product Image */}
                    <div className="product-card relative overflow-hidden">
                      <a href={product.link} className="block">
                        <div className="product-card-image relative">
                          <div className="w-full overflow-hidden relative pt-[150%]">
                            <div className="absolute inset-0">
                              <div className="image-wrapper relative w-full h-full">
                                {isLoading ? (
                                  <div className="skeleton-animated-background w-full h-full bg-gray-200 animate-pulse"></div>
                                ) : (

                                    <img
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      src={product.coverImage.src}
                                      alt={product.name}
                                      srcSet={product.coverImage.srcset}
                                      loading="lazy"
                                    />
                        
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>

                    {/* Product Info */}
                    <div className="product-info p-4">
                      <div className="product-info-wrapper space-y-2">
                        
                        {/* Brand */}
                        <div className="product-vendor">
                          <a href={product.link}>
                            <h2 className="vendor-title text-xs uppercase tracking-wider text-gray-500 font-medium">
                              {product.brand}
                            </h2>
                          </a>
                        </div>

                        {/* Product Name */}
                        <div className="product-title">
                          <a href={product.link}>
                            <h3 className="product-description text-sm font-medium text-gray-900 leading-tight line-clamp-2 hover:text-gray-700 transition-colors">
                              {product.name}
                            </h3>
                          </a>
                        </div>

                        {/* Price */}
                        <div className="product-price-data">
                          <div className="price-compare-container">
                            <div className="price-height">
                              <span className="price-sale">
                                <div className="price-format left-currency">
                                  <span className="simbol text-gray-900 font-semibold">{product.currency}</span>
                                  <span className="text-gray-900 font-semibold ml-1">
                                    {formatPrice(product.price)}
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
                            {product.gender}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="product-card-skeleton-container animate-pulse">
                <div className="product-card-skeleton-image-container skeleton-animated-background w-full pt-[150%] bg-gray-200 rounded-lg"></div>
                <div className="product-card-skeleton-product-name h-4 bg-gray-200 rounded mt-3"></div>
                <div className="product-card-skeleton-product-price h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
              </div>
            ))}
          </div>
        )}
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