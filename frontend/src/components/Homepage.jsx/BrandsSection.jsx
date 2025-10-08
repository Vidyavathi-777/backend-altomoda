import React from 'react';

const BrandsSection = () => {
  const brands = [
    "ALEXANDER MCQUEEN",
    "ALEXANDER WANG",
    "AMIRI",
    "BALENCIAGA",
    "BALMAIN",
    "BURBERRY",
    "DOLCE&GABBANA",
    "DSQUARED2",
    "ETRO",
    "FENDI",
    "FERRAGAMO",
    "GOLDEN GOOSE",
    "GUCCI",
    "JACQUEMUS",
    "JIL SANDER",
    "JIMMY CHOO",
    "KENZO",
    "MAISON MARGIELA",
    "MAX MARA",
    "MONCLER",
    "OFF WHITE",
    "PUCCI",
    "STELLA MCCARTNEY",
    "THOM BROWNE",
    "VERSACE"
  ];

  return (
    <section className="w-full bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-2xl  mb-6 text-gray-900">
          TOP BRANDS
        </h2>
        
        {/* Brands List */}
        <div className="text-sm text-gray-700 leading-relaxed">
          {brands.map((brand, index) => (
            <span key={brand}>
              <a 
                href="#" 
                className="hover:underline transition-all"
              >
                {brand}
              </a>
              {index < brands.length - 1 && (
                <span className="mx-1">-</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;