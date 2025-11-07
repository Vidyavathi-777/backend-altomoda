import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const BrandsSection = () => {
    const { gender = 'woman' } = useParams();
    const [hoveredBrand, setHoveredBrand] = useState(null);
    
    const navitems = {
        man: "68f86b10734810ab97bb98d1",
        woman: "68f86b1c734810ab97bb9a2f"
    };

    const brands = [
        "Alexander Mcqueen",
        "Alexander Wang",
        "Amiri",
        "Balenciaga",
        "Balmain",
        "Burberry",
        "Dolce & Gabbana",
        "Dsquared2",
        "Etro",
        "Fendi",
        "Ferragamo",
        "Golden Goose",
        "Gucci",
        "Jacquemus",
        "Jil Sander",
        "Jimmy Choo",
        "Kenzo",
        "Maison Margiela",
        "Max Mara",
        "Moncler",
        "Off White",
        "Pucci",
        "Stella Mccartney",
        "Thom Browne",
        "Versace"
    ];

    return (
        <section className="w-full bg-white py-20 border-t border-gray-200">
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

                .separator {
                    transition: all 0.3s ease;
                }

                .brand-hover:hover + .separator {
                    color: #D4AF37;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-8">
                {/* Title */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-light tracking-wider mb-4"
                        style={{ fontFamily: 'Didot, serif' }}>
                        CURATED BRANDS
                    </h2>
                    <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
                       style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        Discover the world's most esteemed fashion houses and luxury designers
                    </p>
                </div>
                
                {/* Brands List */}
                <div className="text-center">
                    <div className="inline-flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-4xl mx-auto">
                        {brands.map((brand, index) => (
                            <div key={brand} className="inline-flex items-center">
                                <Link 
                                    to={`/${gender}/${navitems[gender]}/${brand}/products`}
                                    className="group"
                                    onMouseEnter={() => setHoveredBrand(brand)}
                                    onMouseLeave={() => setHoveredBrand(null)}
                                >
                                    <span className="text-sm tracking-wider uppercase brand-hover relative"
                                          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                        {brand}
                                        {/* Animated underline */}
                                        <span className="absolute bottom-0 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                </Link>
                                {index < brands.length - 1 && (
                                    <span className="separator text-gray-400 mx-4 text-sm"
                                          style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        •
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hover Effect Display */}
                {hoveredBrand && (
                    <div className="text-center mt-12 opacity-0 animate-fadeIn">
                        <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2"
                           style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Currently Viewing
                        </p>
                        <p className="text-2xl font-light text-gold tracking-wide"
                           style={{ fontFamily: 'Didot, serif' }}>
                            {hoveredBrand}
                        </p>
                    </div>
                )}

                {/* CTA Button */}
                <div className="text-center mt-16">
                    <Link 
                        to={`/${gender}/designers`}
                        className="inline-block border border-black text-black px-12 py-4 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        Explore All Brands
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease forwards;
                }
            `}</style>
        </section>
    );
};

export default BrandsSection;