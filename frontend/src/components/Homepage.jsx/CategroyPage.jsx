import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import women from "../../assets/womens-collection.jpg";
import men from "../../assets/mens-collections.jpg";


const fadeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const scaleVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
};

const CategoryPage = ({ sliders }) => {
  const { gender = "woman" } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef(null);
  const previousGender = useRef(gender);
  const subcategoriesRef = useRef(null);

  // Filter categories whenever gender changes
  useEffect(() => {
    const filteredCategories = sliders.filter(
      (cat) => cat.gender === gender && cat._id !== "Brands"
    );

    setCategories(filteredCategories);

    // Reset selected category when gender changes
    if (filteredCategories.length > 0) {
      // Only reset if gender actually changed
      if (previousGender.current !== gender) {
        setSelectedCategory(filteredCategories[0]);
        previousGender.current = gender;
      } else if (!selectedCategory) {
        // Initial load
        setSelectedCategory(filteredCategories[0]);
      }
    }
  }, [gender, sliders]);

  // Ensure selectedCategory is always from current gender's categories
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      // Check if selectedCategory belongs to current gender
      const currentCategory = categories.find(cat => cat._id === selectedCategory._id);
      if (!currentCategory) {
        // If not, set to first category of current gender
        setSelectedCategory(categories[0]);
      }
    }
  }, [categories, selectedCategory]);

    const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    // Smooth scroll to subcategories section
    setTimeout(() => {
      subcategoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(window.scrollTimer);
      window.scrollTimer = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!selectedCategory || categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto mb-4"
          />
          <p className="text-neutral-500 font-light tracking-widest">Loading Collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-6 md:py-1">
      <motion.div
        key={`banner-${gender}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[48vh] md:h-[60vh] lg:h-[120vh] overflow-hidden rounded-none mb-12"
      >
        {/* Background Image */}
        <motion.img
          src={gender === "woman" ? women : men}
          alt="collection-banner"
          className="w-full h-full object-cover brightness-90"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
 
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

        {/* CENTER TEXT CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white font-light lg:leading-16  leading-10
              text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[68px]"style={{
            fontFamily: "Cormorant Garamond, Didot, serif",
          }}>
            {gender === "woman" ? "Women's Collection" : gender === "man" ? "Men's Collection" : "Kids' Collection"}
          </h1>

          <p className="text-sm md:text-base text-neutral-200 mt-4 tracking-[0.35em] font-light">
            CURATED • PREMIUM • EDITORIAL
          </p>
        </div>

        {/* CATEGORY SELECTOR ON BANNER */}
        <div className="absolute bottom-6 w-full lg:py-80 py-10 px-4 flex items-center justify-center">
          <div className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide px-3 py-2 bg-white/10 backdrop-blur-md rounded-full">
            {categories.map((cat) => (
              <button
                key={`banner-cat-${cat._id}`}
                onClick={() => handleCategoryClick(cat)}
                className={`
            px-5 py-4 rounded-full text-xs md:text-sm font-light whitespace-nowrap
            transition-all duration-400 backdrop-blur-sm border  
            ${selectedCategory._id === cat._id
                    ? "text-white border-white bg-white/20"
                    : "text-neutral-200 border-neutral-400/50 hover:text-white hover:border-white"}
          `}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          ref={subcategoriesRef}
          key={`${gender}-${selectedCategory._id}`}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
        >
          {/* Collection Title */}
          <div className="px-4 md:px-8 mb-6 md:mb-10">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-3xl font-light tracking-wider text-neutral-700 text-center"  style={{ fontFamily: 'Didot, serif' }}
            >
              {selectedCategory.title}
            </motion.h2>
          </div>

          {/* Responsive Grid Container */}
          <div className="px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {selectedCategory.children && selectedCategory.children.length > 0 ? (
                selectedCategory.children.map((item, index) => (
                  <motion.div
                    key={`${gender}-${selectedCategory._id}-${item._id}`}
                    initial="hidden"
                    animate="visible"
                    variants={scaleVariants}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="group relative w-full"
                  >
                    {/* Image Container with Luxury Effects */}
                    <div className="relative w-full overflow-hidden bg-transparent rounded-none">
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                      {/* Image with Enhanced Animation */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-auto object-cover aspect-[3/4]"
                          loading="lazy"
                        />
                      </motion.div>

                    </div>

                    {/* Title with Luxury Typography */}
                    <div className="mt-4 text-center"  style={{ fontFamily: 'Didot, serif' }}>
                      <p className="text-sm md:text-base font-light tracking-widest text-neutral-700 uppercase"
                      >
                        {item.title}
                      </p>
                      <div className="h-px w-12 bg-neutral-300 mx-auto mt-2 group-hover:w-24 transition-all duration-500" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-neutral-400 font-light tracking-widest text-lg md:text-xl"
                  >
                    Coming Soon • New Arrivals
                  </motion.p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Scroll Indicator */}
      {isScrolling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 hidden md:block"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </motion.div>
      )}

      <style>
        {`
        /* Add to your global CSS */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Luxury smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Image loading animation */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.img-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

/* Responsive breakpoints */
@media (max-width: 640px) {
  .luxury-card {
    margin-bottom: 1rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .luxury-card {
    margin-bottom: 1.5rem;
  }
}
  `}
      </style>





    </div>
  );
};

export default CategoryPage;