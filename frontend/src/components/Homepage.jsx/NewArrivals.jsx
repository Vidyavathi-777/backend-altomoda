import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { transformProduct } from "../../api/productsApi";
import banner from '/src/assets/newArrivals.png';


const NewArrivals = () => {
  const { gender = "woman" } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mobileTimers, setMobileTimers] = useState({});
  const sliderRef = useRef(null);
  const observerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navitems = {
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f",
  };

  const categoryIds = {
    man: {
      newArrivals: "68f86b10734810ab97bb98d1",
      bags: "68f86b15734810ab97bb9967",
      shoes: "68f86b15734810ab97bb997d"
    },
    woman: {
      newArrivals: "68f86b1c734810ab97bb9a2f",
      bags: "68f86b24734810ab97bb9b1f",
      shoes: "68f86b25734810ab97bb9b37"
    }
  };

  const getProductRoute = (targetGender, categoryType = 'newArrivals') => {
    const categoryId = categoryIds[targetGender]?.[categoryType] || categoryIds[targetGender]?.newArrivals;
    return `/${targetGender}/${categoryId}/new-arrivals/products`;
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



  const randomFour = useMemo(
    () => products.sort(() => Math.random() - 0.5).slice(0, 4),
    [products]
  );

  const ProductCard = ({ product }) => (
    <div className="group flex flex-col">

      <div className="relative overflow-hidden rounded-md bg-gray-50 w-[300px] h-[400px]">
        <img
          src={product.images[0]}
          alt={product.productName}
          className="w-full h-full object-cover"
        />
      </div>

      <span className="text-xs uppercase tracking-widest text-gray-500 mt-3">
        {product.brand}
      </span>

      <h3
        className="text-lg font-light uppercase tracking-wider line-clamp-2"
        style={{ fontFamily: "Didot, serif" }}
      >
        {product.productName}
      </h3>

      <span className="text-sm font-medium">
        RS. {product.minPrice.toLocaleString("en-IN")}
      </span>
    </div>
  );


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

          @media (max-width: 768px) {
    .mobile-scroll-wrapper {
      display: flex;
      overflow-x: auto;
      gap: 16px;
      scroll-snap-type: x mandatory;
      padding-bottom: 10px;
    }
    .mobile-scroll-wrapper::-webkit-scrollbar {
      display: none;
    }
    .mobile-scroll-item {
      min-width: 70%;
      scroll-snap-align: start;
    }
  }
      `}</style>
      {/* <section className="relative w-full bg-white">
        <div className="relative w-full overflow-hidden">
          <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh] lg:h-full overflow-hidden">
            <img
              src={banner}
              alt="New Arrivals Collection"
              className="w-full h-full object-cover object-center"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white space-y-4 px-4">

                <h2
                  className="text-xl sm:text-2xl lg:text-3xl uppercase -mt-[100px] tracking-[3px] opacity-80 mb-4 hover:text-black"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  New Arrivals
                </h2>
                <p className="text-white font-light lg:leading-16  leading-10 max-w-[1000px]
              text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[68px] mb-4 hover:text-black"
                  style={{ fontFamily: 'Cormorant Garamond, Didot, serif' }}>
                  Discover the latest additions
                </p>
                <Link
                  to={getProductRoute(gender, 'newArrivals')}
                  className="bg-white text-black px-6 py-2 text-sm uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {randomFour.length >= 4 && (
        <section className="w-full bg-white py-12 md:py-20 px-4 sm:px-6 lg:px-8 xl:px-20 section-pattern">
          <div className="max-w-8xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

              {/* LEFT SIDE TEXT - Enhanced */}
              <div className="lg:w-1/3 space-y-6 md:space-y-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                    Latest Collection
                  </span>
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide uppercase mb-4"
                    style={{ fontFamily: "Didot, serif" }}
                  >
                    Just Landed
                  </h2>
                  <div className="w-16 h-px bg-black mb-6"></div>
                </div>

                <p className="text-gray-600 leading-relaxed text-base md:text-lg max-w-lg">
                  Discover the latest additions to our newest collections.
                  Explore premium arrivals and exclusive launches curated just for you.
                </p>

                <div className="pt-4">
                  <Link
                    to={getProductRoute(gender, "newArrivals")}
                    className="inline-flex items-center px-8 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 group"
                  >
                    Shop Now
                    <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Indicators for mobile */}
                {isMobile && (
                  <div className="flex items-center gap-2 pt-4">
                    {randomFour.map((_, idx) => (
                      <div
                        key={idx}
                        className="w-2 h-2 rounded-full bg-gray-300"
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE PRODUCT CARDS - Enhanced */}
              <div className="lg:w-2/3">

                {/* DESKTOP GRID (≥1024px) */}
                <div className="hidden lg:grid grid-cols-4 gap-8">
                  {randomFour.map((product) => (
                    <Link key={product.id} to={`/${gender}/product/${product.sku}`}>
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>

                {/* TABLET & MOBILE HORIZONTAL SCROLLER (<1024px) */}
                <div className="flex lg:hidden overflow-x-auto gap-6 px-2 pb-4 snap-x snap-mandatory scrollbar-hide">
                  {randomFour.map((product) => (
                    <Link
                      key={product.id}
                      to={`/${gender}/product/${product.sku}`}
                      className="flex-shrink-0 w-[80%] sm:w-[60%] md:w-[45%] snap-start"
                    >
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

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
                      <div className="relative w-[300px] h-[400px] bg-gray-50 overflow-hidden mb-3">
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
                      <div className="product-details px-1 md:px-2">
                        <div className="mb-2">
                          <span className="text-xs uppercase tracking-widest text-gray-500">
                            {product.brand}
                          </span>
                        </div>
                        <h3
                          className="text-lg md:text-xl font-light uppercase tracking-wider mb-2 md:mb-3 line-clamp-2"
                          style={{ fontFamily: "Didot, serif" }}
                        >
                          {product.productName}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm md:text-base font-medium">
                            {product.minPrice === product.maxPrice
                              ? `RS. ${product.minPrice.toLocaleString('en-IN')}`
                              : `RS. ${product.minPrice.toLocaleString('en-IN')}`}
                          </span>
                          {product.variantCount > 1 && (
                            <span className="text-xs text-gray-600">
                              {product.variantCount} sizes
                            </span>
                          )}
                        </div>
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
