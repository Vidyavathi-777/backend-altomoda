import React from 'react';

const BrandsSection = () => {
  const brandsData = {
    title: "TOP BRANDS",
    brands: [
      "ALEXANDER WANG", "AMIRI", "BALENCIAGA", "BALMAIN", "BURBERRY",
      "DOLCE&GABBANA", "DSQUARED2", "ETRO", "FENDI", "FERRAGAMO",
      "GOLDEN GOOSE", "GUCCI", "JACQUEMUS", "JIL SANDER", "JIMMY CHOO",
      "KENZO", "MAISON MARGIELA", "MAX MARA", "MCQUEEN", "MONCLER",
      "OFF WHITE", "PUCCI", "STELLA MCCARTNEY", "THOM BROWNE",
      "VALENTINO GARAVANI", "VERSACE"
    ]
  };

  return (
    <div className="w-full bg-gray-200 py-12 border-b border-gray-200">
      {/* Title */}
      <div className="max-w-7xl mx-auto text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide text-gray-800 mb-8">
        {brandsData.title}.
      </div>
      
      {/* Brands List */}
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-4 gap-y-3">
        {brandsData.brands.map((brand, index) => (
          <span key={brand} className="text-sm sm:text-base md:text-lg font-medium text-gray-600">
            {brand}
            {index < brandsData.brands.length - 1 && (
              <span className="text-gray-400 mx-2">-</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BrandsSection;
