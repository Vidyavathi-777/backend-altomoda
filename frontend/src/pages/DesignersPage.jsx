import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import productsData from '../json/productsData.json';

const DesignersPage = () => {
  const { gender = 'woman' } = useParams();

  const getBrandsByGender = (selectedGender) => {
    const products = productsData.productSlider.products;
    const brands = [...new Set(
      products
        .filter(p => p.gender === selectedGender)
        .map(p => p.brand)
    )].sort();
    return brands;
  };

  const brands = getBrandsByGender(gender);

  // Group brands by first character
  const groupBrandsByLetter = (brandList) => {
    const grouped = {};
    brandList.forEach(brand => {
      const firstChar = brand.charAt(0).toUpperCase();
      if (!grouped[firstChar]) {
        grouped[firstChar] = [];
      }
      grouped[firstChar].push(brand);
    });
    return grouped;
  };

  const groupedBrands = groupBrandsByLetter(brands);
  const letters = Object.keys(groupedBrands).sort();

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
          {letters.map(letter => (
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
                {groupedBrands[letter].map(brand => (
                  <Link
                    key={brand}
                    to={`/${gender}/designers/${brand}/products`}
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