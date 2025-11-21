import React, { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { transformProduct } from "../../api/productsApi";

const NewArrivals = () => {
  const { gender = "woman" } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mobileTimers, setMobileTimers] = useState({});
  const sliderRef = useRef(null);
  const observerRef = useRef(null);

  const navitems = {
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f",
  };

  // ------------------ Fetch Products ------------------
  const fetchNewArrivals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryId = navitems[gender];
      if (!categoryId) throw new Error(`Invalid gender: ${gender}`);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/new-arrivals/${categoryId}?page=1&limit=40`
      );
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      if (data.success && Array.isArray(data.data?.products)) {
        const transformedProducts = data.data.products.map(transformProduct);
        setProducts(transformedProducts.slice(0, 20));
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch new arrivals");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
  }, [gender]);

  // ------------------ Mobile/Tablet Timer ------------------
  useEffect(() => {
    if (products.length === 0) return;
    const isMobile = window.innerWidth < 1100;
    if (!isMobile) return;

    const options = { root: sliderRef.current, threshold: 0.6 };
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const productId = entry.target.dataset.productId;
        const product = products.find((p) => p.id === productId);
        if (!product || product.images.length < 2) return;

        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            setMobileTimers((prev) => ({ ...prev, [productId]: true }));
          }, 3000);
          setMobileTimers((prev) => ({
            ...prev,
            [`${productId}_timer`]: timer,
          }));
        } else {
          setMobileTimers((prev) => {
            const updated = { ...prev };
            if (updated[`${productId}_timer`]) {
              clearTimeout(updated[`${productId}_timer`]);
              delete updated[`${productId}_timer`];
            }
            delete updated[productId];
            return updated;
          });
        }
      });
    }, options);

    const productCards = sliderRef.current?.querySelectorAll("[data-product-id]");
    productCards?.forEach((card) => observerRef.current.observe(card));

    return () => {
      observerRef.current?.disconnect();
      Object.values(mobileTimers).forEach((timer) => {
        if (typeof timer === "number") clearTimeout(timer);
      });
    };
  }, [products]);

  // ------------------ Image Logic ------------------
  const getDisplayImage = (product) => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      const timerCompleted = mobileTimers[product.id];
      if (timerCompleted && product.images.length >= 3)
        return product.images[2];
      if (timerCompleted && product.images.length === 2)
        return product.images[1];
      return product.images[0];
    } else {
      const isHovered = hoveredProduct === product.id;
      if (isHovered && product.images.length >= 3) return product.images[2];
      if (isHovered && product.images.length === 2) return product.images[1];
      return product.images[0];
    }
  };

  // ------------------ Scroll Controls ------------------
  const scrollByCards = (count) => {
    if (sliderRef.current) {
      const firstCard = sliderRef.current.querySelector(".product-card");
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 24;
        sliderRef.current.scrollBy({
          left: cardWidth * count,
          behavior: "smooth",
        });
      }
    }
  };
  const scrollLeft = () => scrollByCards(-4);
  const scrollRight = () => scrollByCards(4);

  // ------------------ JSX ------------------
  return (
    <div className="bg-white py-16 border-t border-gray-200 w-full">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Product card responsive sizes */
        .product-card {
          transition: all 0.3s ease;
        }

        @media (min-width: 1024px) {
          .product-card { width: 300px; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-card { width: 240px; }
        }
        @media (max-width: 767px) {
          .product-card { width: 80vw; }
        }
      `}</style>

      <div className="w-full">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-gray-200 flex justify-between items-center px-8">
          <h3
            className="text-4xl tracking-wider font-light"
            style={{ fontFamily: "Didot, serif" }}
          >
            New Arrivals
          </h3>
        </div>

        {/* Product Slider */}
        {isLoading ? (
          <div className="flex gap-6 px-8 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-64 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-6">Error loading new arrivals</p>
            <button
              onClick={fetchNewArrivals}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="relative">
            {/* Scroll Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 w-10 h-10 rounded-full shadow hover:bg-gray-100 hidden lg:flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 w-10 h-10 rounded-full shadow hover:bg-gray-100 hidden lg:flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slider */}
            <div
              ref={sliderRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth px-8"
            >
              <div className="flex gap-6 pb-4">
                {products.map((product) => {
                  const displayImage = getDisplayImage(product);
                  const isMobile = window.innerWidth < 1024;
                  const timerCompleted = mobileTimers[product.id];
                  return (
                    <Link
                      key={product.id}
                      data-product-id={product.id}
                      to={`/${gender}/product/${product.sku}`}
                      onMouseEnter={() =>
                        !isMobile && setHoveredProduct(product.id)
                      }
                      onMouseLeave={() =>
                        !isMobile && setHoveredProduct(null)
                      }
                      className="product-card flex-shrink-0"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-3">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={product.productName}
                            className="w-full h-full object-cover transition-all duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100"></div>
                        )}

                        {/* "New" badge */}
                        <div className="absolute top-3 left-3 bg-black text-white text-[10px] px-2 py-1 tracking-[0.2em]">
                          NEW
                        </div>

                        {/* Mobile visual indicator */}
                        {/* {isMobile && product.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            {timerCompleted
                              ? product.images.length >= 3
                                ? "3RD IMAGE"
                                : "2ND IMAGE"
                              : "3s → Next"}
                          </div>
                        )} */}
                      </div>

                      {/* Info */}
                      <div className="space-y-1 px-1">
                        <h3
                          className="text-xs tracking-[0.3em] uppercase"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {product.brand}
                        </h3>
                        <p
                          className="text-sm leading-snug line-clamp-2"
                          style={{ fontFamily: "Cormorant Garamond, serif" }}
                        >
                          {product.productName}
                        </p>
                        <p
                          className="text-sm tracking-wide"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {product.minPrice === product.maxPrice
                            ? `RS. ${product.minPrice.toLocaleString('en-IN')}`
                            : `RS. ${product.minPrice.toLocaleString('en-IN')} - ${product.maxPrice.toLocaleString('en-IN')}`}
                        </p>
                        {product.variantCount > 1 && (
                          <p className="text-2xl inline bg-black text-white text-[10px] px-2  py-3 tracking-[0.2em]" style={{ fontFamily: "Montserrat, sans-serif" }}>
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
          <div className="text-center py-16 text-gray-500">No New Arrivals</div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
