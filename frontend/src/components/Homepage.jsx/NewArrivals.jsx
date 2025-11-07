import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { transformProduct } from '../../api/productsApi';

const NewArrivals = () => {
  const { gender = 'woman' } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const sliderRef = useRef(null);
  
  const navitems = {
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f"
  };

  const fetchNewArrivals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const categoryId = navitems[gender];
      if (!categoryId) {
        throw new Error(`Invalid gender: ${gender}`);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/new-arrivals/${categoryId}?page=1&limit=40`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.products)) {
        const transformedProducts = data.data.products.map(product => transformProduct(product));
        const limitedProducts = transformedProducts.slice(0, 20);
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

  const scrollByCards = (count) => {
    if (sliderRef.current) {
      const firstCard = sliderRef.current.querySelector('.product-card');
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 32; // 32px gap
        sliderRef.current.scrollBy({ left: cardWidth * count, behavior: 'smooth' });
      }
    }
  };

  const scrollLeft = () => scrollByCards(-5);
  const scrollRight = () => scrollByCards(5);

  // Function to get the image to display based on hover state
  const getDisplayImage = (product) => {
    const isHovered = hoveredProduct === product.id;
    
    if (!isHovered) {
      // Default state: always show first image
      return product.images[0];
    } else {
      // Hover state: show third image if available, otherwise second image
      if (product.images.length >= 3) {
        return product.images[2]; // Third image
      } else if (product.images.length === 2) {
        return product.images[1]; // Second image
      } else {
        return product.images[0]; // Only one image available
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white py-16 border-t border-gray-200 w-full">
        <div className="w-full">
          <div className="mb-12 pb-8 border-b border-gray-200 px-8">
            <h3 
              className="text-4xl tracking-wider font-light"
              style={{ fontFamily: 'Didot, serif' }}
            >
              New Arrivals
            </h3>
          </div>
          
          <div className="flex gap-8 overflow-hidden px-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-16 border-t border-gray-200 w-full">
        <div className="w-full">
          <div className="mb-12 pb-8 border-b border-gray-200 px-8">
            <h3 
              className="text-4xl tracking-wider font-light"
              style={{ fontFamily: 'Didot, serif' }}
            >
              New Arrivals
            </h3>
          </div>
          <div className="text-center py-12">
            <p 
              className="text-red-600 mb-6 tracking-wider"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Error loading new arrivals
            </p>
            <button
              onClick={fetchNewArrivals}
              className="px-8 py-3 bg-black text-white text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 border-t border-gray-200 w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="w-full">
        {/* Header Section */}
        <div className="mb-12 pb-8 border-b border-gray-200 flex justify-between items-center px-8">
          <h3 
            className="text-4xl tracking-wider font-light"
            style={{ fontFamily: 'Didot, serif' }}
          >
            New Arrivals
          </h3>
          
          {/* <Link
            to={`/${gender}/products`}
            className="text-sm tracking-[0.2em] uppercase underline hover:no-underline"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            View All
          </Link> */}
        </div>

        {/* Products Slider */}
        {products.length > 0 ? (
          <div className="relative w-full">
            {/* Navigation Buttons */}
            <button
              onClick={scrollLeft}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={scrollRight}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Products Horizontal Scroll */}
            <div
              ref={sliderRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth w-full px-8"
            >
              <div className="flex gap-8 pb-4" style={{ minWidth: 'min-content' }}>
                {products.map((product) => {
                  const displayImage = getDisplayImage(product);
                  const isHovered = hoveredProduct === product.id;

                  return (
                    <Link
                      key={product.id}
                      to={`/${gender}/product/${product.sku}`}
                      className="product-card group cursor-pointer flex-shrink-0 w-64"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Product Image Container */}
                      <div className="relative aspect-[3/4] bg-gray-50 mb-4 overflow-hidden">
                        {displayImage ? (
                          <div className="w-full h-full">
                            <img
                              src={displayImage}
                              alt={product.productName}
                              className="w-full h-full object-cover transition-opacity duration-500"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            No Image
                          </div>
                        )}

                        {/* New Badge */}
                        <div 
                          className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-[0.2em]"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          NEW
                        </div>

                        {/* Image Indicator */}
                        {product.images.length > 1 && (
                          <div 
                            className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 text-xs tracking-wider"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {product.images.length} IMAGES
                          </div>
                        )}

                        {/* Hover Indicator */}
                        {isHovered && product.images.length > 1 && (
                          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                            {/* <div className="bg-white/90 px-3 py-1 rounded text-xs tracking-wider">
                              {product.images.length >= 3 ? 'View 3rd Image' : 'View 2nd Image'}
                            </div> */}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 px-2">
                        <h3 
                          className="text-xs tracking-[0.3em] uppercase font-medium"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {product.brand}
                        </h3>
                        <p 
                          className="text-sm leading-relaxed line-clamp-2"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}
                        >
                          {product.productName}
                        </p>
                        <div className="pt-2">
                          <p 
                            className="text-sm tracking-wider"
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
                            className="text-xs text-gray-600 tracking-wider"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {product.variantCount} SIZES
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <p 
              className="text-2xl tracking-wider"
              style={{ fontFamily: 'Didot, serif' }}
            >
              No New Arrivals Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;