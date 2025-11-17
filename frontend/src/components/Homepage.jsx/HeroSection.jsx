import React from 'react';
import { Link, useParams } from 'react-router-dom';
import banner from '/src/assets/newArrivals.png';

const HeroSection = () => {
    const { gender = 'woman' } = useParams();

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

    const bannerItems = [
        {
            id: 1,
            image: "https://res.cloudinary.com/contentchef/image/upload/w_1200,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/DONNA_02",
            alt: "WOMAN",
            title: "New bags just landed",
            subtitle: "Add personality to your style. Discover our FW25 selection and find the perfect bag to complete your look.",
            buttonText: "Shop Now",
            gender: "woman",
            category: "bags"
        },
        {
            id: 2,
            image: "https://res.cloudinary.com/contentchef/image/upload/w_1200,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/DONNA_03",
            alt: "WOMAN",
            title: "FW25: The shoes you've been waiting for",
            subtitle: "From loafers to sneakers—start the season with the right pair",
            buttonText: "Shop Now",
            gender: "woman",
            category: "shoes"
        },
        {
            id: 3,
            image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/UOMO_02",
            alt: "MAN",
            title: "New bags just landed",
            subtitle: "From loafers to sneakers—start the season with the right pair",
            buttonText: "Shop Now",
            gender: "man",
            category: "bags"
        },
        {
            id: 4,
            image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/UOMO_03_ALL",
            alt: "MAN",
            title: "FW25: The shoes you've been waiting for",
            subtitle: "From loafers to sneakers—start the season with the right pair",
            buttonText: "Shop Now",
            gender: "man",
            category: "shoes"
        }
    ];

    const filteredBannerItems = bannerItems.filter(item => item.gender === gender);

    const getProductRoute = (targetGender, categoryType = 'newArrivals') => {
        const categoryId = categoryIds[targetGender]?.[categoryType] || categoryIds[targetGender]?.newArrivals;
        return `/${targetGender}/${categoryId}/new-arrivals/products`;
    };

    return (
        <>
            {/* Main Hero Banner - Full Width */}
            <div className="relative w-full bg-white pt-[10px] lg:pt-[50px] ">
                <div className="relative w-full">
                    <div className="w-full h-[100vh] min-h-[500px] max-h-[1000px] overflow-hidden">
                        <img
                            className="w-full h-full object-cover"
                            src="https://res.cloudinary.com/contentchef/image/upload/w_1920,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/HOME_SETTEMBRE_2_UOMO-DONNA"
                            alt="New Season Fashion Collection"
                            loading="eager"
                        />
                        {/* Overlay Content */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <div className="text-center text-white space-y-6 px-4">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider uppercase mb-4"
                                    style={{ fontFamily: 'Didot, serif' }}>
                                    NEW SEASON
                                </h1>
                                <p className="text-lg md:text-xl lg:text-2xl tracking-widest uppercase mb-8"
                                   style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Discover FW25 Collection
                                </p>
                                <Link
                                    to={getProductRoute(gender, 'newArrivals')}
                                    className="px-12 py-4 bg-white text-black text-sm font-medium uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 border border-white"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    Shop The Collection
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Info Section */}
                <div className="w-full py-12 px-4 bg-white">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase"
                            style={{ fontFamily: 'Didot, serif' }}>
                            NEW SEASON, NEW STYLE
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
                           style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Refresh your wardrobe now with our latest FW25 arrivals. Discover curated pieces that define this season's elegance.
                        </p>
                        <Link
                            to={getProductRoute(gender, 'newArrivals')}
                            className="px-8 py-3 border border-black text-black text-xs font-medium uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 mt-4"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Explore New Arrivals
                        </Link>
                    </div>
                </div>
            </div>

            {/* Promotional Banners Grid */}
            <div className="w-full py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                        {filteredBannerItems.map((item) => (
                            <div key={item.id} className="group cursor-pointer">
                                {/* Image Section */}
                                <div className="relative overflow-hidden">
                                    <div className="w-full pt-[125%] relative">
                                        <img
                                            className="absolute inset-0 w-full h-full object-cover bg-gray-100 transition-transform duration-700 group-hover:scale-110"
                                            src={item.image}
                                            alt={item.alt}
                                            loading="lazy"
                                        />
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
                                    </div>
                                </div>

                                {/* Text Section */}
                                <div className="text-center mt-8 space-y-4">
                                    <h3 className="text-2xl font-light tracking-wide uppercase"
                                        style={{ fontFamily: 'Didot, serif' }}>
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto"
                                       style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        {item.subtitle}
                                    </p>
                                    <Link
                                        to={getProductRoute(item.gender, item.category)}
                                        className="inline-block px-8 py-3 border border-black text-black text-xs font-medium uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        {item.buttonText}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Width Bottom Banner */}
            <section className="relative w-full bg-white">
                <div className="relative w-full overflow-hidden">
                    <div className="w-full h-[60vh] min-h-[500px] max-h-[700px]">
                        <img 
                            src={banner} 
                            alt="New Arrivals Collection"
                            className="w-full h-full object-cover"
                        />
                        {/* Optional Overlay Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white space-y-4 px-4">
                                <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase"
                                    style={{ fontFamily: 'Didot, serif' }}>
                                    New Arrivals
                                </h2>
                                <p className="text-lg md:text-xl tracking-widest uppercase"
                                   style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Discover the latest additions
                                </p>
                                <Link
                                    to={getProductRoute(gender, 'newArrivals')}
                                    className="inline-block px-10 py-3 bg-white text-black text-sm font-medium uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 mt-4"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');
                
                @font-face {
                    font-family: 'Didot';
                    src: local('Didot'), local('Didot LT STD');
                    font-weight: normal;
                    font-style: normal;
                }
            `}</style>
        </>
    );
};

export default HeroSection;



                            {/* <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                                src="https://res.cloudinary.com/contentchef/video/upload/w_1980,q_auto,f_auto/thecorner-d377/PxDkkgi0ODy/PRODUCT%20FINDER/Product%20Finder%20ENG%202"
                            /> */}