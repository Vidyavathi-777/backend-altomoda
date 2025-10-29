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
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading brands...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-wider uppercase mb-2">
            DESIGNERS {gender.toUpperCase()}
          </h1>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {letters.map((letter) => (
            <div key={letter} className="space-y-4">
              {/* Letter Header */}
              <div className="mb-6">
                <h2 className="text-4xl md:text-5xl font-light italic text-gray-800 mb-1">
                  {letter}
                </h2>
                <div className="h-px bg-gray-300 w-full"></div>
              </div>

              {/* Brand List */}
              <div className="space-y-3">
                {groupedBrands[letter].map((brand) => (
                  <Link
                    key={brand}
                    to={`/${gender}/${categoryIds[gender]}/${brand}/products`}
                    className="block text-sm md:text-base hover:underline transition-all"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignersPage;
