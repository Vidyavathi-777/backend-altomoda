import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const DesignersPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const { gender = "woman" } = useParams();

  // Category IDs mapped by gender
  const categoryIds = {
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f",
  };

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBrand, setHoveredBrand] = useState(null);

  // ✅ Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ✅ Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/brands`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
          setBrands(data.data.brands || []);
        } else {
          console.error("Failed to fetch brands:", data.message);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [API_BASE_URL]);

  // ✅ Group brands alphabetically
  const groupBrandsByLetter = (brandList) => {
    const grouped = {};
    brandList.forEach((brand) => {
      const firstChar = brand.charAt(0).toUpperCase();
      if (!grouped[firstChar]) grouped[firstChar] = [];
      grouped[firstChar].push(brand);
    });
    return grouped;
  };

  const groupedBrands = groupBrandsByLetter(brands);
  const letters = Object.keys(groupedBrands).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600 tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Loading Luxury Brands...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[200px]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }

        .brand-hover {
          transition: all 0.3s ease;
        }

        .brand-hover:hover {
          color: #D4AF37;
          transform: translateX(8px);
        }

        .letter-section {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gold-gradient {
          background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-4"
              style={{ fontFamily: 'Didot, serif' }}>
            DESIGNERS
          </h1>
          <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 tracking-wide uppercase"
             style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {gender === 'woman' ? 'WOMEN\'S COLLECTION' : 'MEN\'S COLLECTION'}
          </p>
        </div>

        {/* Mobile View - Single Column with Alphabet Navigation */}
        <div className="block lg:hidden">
          {/* Alphabet Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 pb-6 border-b border-gray-200">
            {letters.map((letter) => (
              <a 
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm border border-gray-300 hover:border-gold hover:text-gold transition-all"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {letter}
              </a>
            ))}
          </div>

          {/* Mobile Brands List */}
          <div className="space-y-12">
            {letters.map((letter, index) => (
              <div 
                key={letter} 
                id={`letter-${letter}`}
                className="letter-section space-y-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Letter Header */}
                <div className="mb-6">
                  <h2 className="text-5xl font-light italic text-gray-800 mb-2 gold-gradient"
                      style={{ fontFamily: 'Didot, serif' }}>
                    {letter}
                  </h2>
                  <div className="h-px bg-gray-200 w-full"></div>
                </div>

                {/* Brand List */}
                <div className="space-y-3">
                  {groupedBrands[letter].map((brand) => (
                    <Link
                      key={brand}
                      to={`/${gender}/${categoryIds[gender]}/${brand}/products`}
                      className="block text-base tracking-wider brand-hover relative pl-4"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      onMouseEnter={() => setHoveredBrand(brand)}
                      onMouseLeave={() => setHoveredBrand(null)}
                    >
                      {/* Animated bullet */}
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full transition-all duration-300 group-hover:bg-gold"></span>
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View - Multi-column Grid */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-x-12 gap-y-16">
            {letters.map((letter, index) => (
              <div 
                key={letter} 
                className="letter-section space-y-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Letter Header */}
                <div className="mb-6">
                  <h2 className="text-5xl font-light italic text-gray-800 mb-2 gold-gradient"
                      style={{ fontFamily: 'Didot, serif' }}>
                    {letter}
                  </h2>
                  <div className="h-px bg-gray-200 w-full"></div>
                </div>

                {/* Brand List */}
                <div className="space-y-3">
                  {groupedBrands[letter].map((brand) => (
                    <Link
                      key={brand}
                      to={`/${gender}/${categoryIds[gender]}/${brand}/products`}
                      className="block text-base tracking-wider brand-hover relative pl-4 group"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      onMouseEnter={() => setHoveredBrand(brand)}
                      onMouseLeave={() => setHoveredBrand(null)}
                    >
                      {/* Animated bullet */}
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full transition-all duration-300 group-hover:bg-gold group-hover:scale-150"></span>
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Brand Display */}
        {/* {hoveredBrand && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm tracking-wider opacity-0 animate-fadeIn z-50"
               style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Explore {hoveredBrand}
          </div>
        )} */}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default DesignersPage;