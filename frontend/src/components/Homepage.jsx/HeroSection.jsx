import React from 'react';

const HeroSection = () => {

    const bannerItems = [
        {
            id: 1,
            image: "https://res.cloudinary.com/contentchef/image/upload/w_1200,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/DONNA_02",
            alt: "WOMAN",
            title: "New bags just landed",
            subtitle: "Add personality to your style. Discover our FW25 selection and find the perfect bag to complete your look.",
            buttonText: "Shop Now"
        },
        {
            id: 2,
            image: "https://res.cloudinary.com/contentchef/image/upload/w_1200,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/DONNA_03",
            alt: "WOMAN",
            title: "FW25: The shoes you've been waiting for",
            subtitle: "From loafers to sneakers—start the season with the right pair",
            buttonText: "Shop Now"
        }
    ];
    return (
        <>
            <div className="relative w-full bg-white">
                {/* Hero Image Section */}
                <div className="relative w-full">
                    <div className="relative w-full overflow-hidden pt-[56.05%]">
                        <div className="absolute inset-0">
                            <div className="absolute inset-0">
                                <img
                                    className="w-full h-full object-cover"
                                    src="https://res.cloudinary.com/contentchef/image/upload/w_1200,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/09_26_25/HOME_SETTEMBRE_2_UOMO-DONNA"
                                    alt="New Season Fashion Collection"
                                    loading="eager"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Overlay - Positioned at bottom left like the image */}
                <div className="w-full py-6 px-4">
                    <div className="text-center space-y-3">
                        <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                            NEW SEASON, NEW STYLE
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
                            Refresh your wardrobe now with our latest FW25 arrivals
                        </p>
                        <button
                            type="button"
                            className="  px-6 py-4 border border-gray-600 rounded-4xl text-xs md:text-sm font-medium uppercase tracking-widest hover:bg-gray-800 hover:text-white transition-colors duration-300 mt-2"
                        >
                            Shop Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full py-8 md:py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {bannerItems.map((item) => (
                            <div key={item.id} className="group">
                                {/* Image Section */}
                                <div className="relative overflow-hidden cursor-pointer">
                                    <div className="w-full pt-[114.85714285714286%] relative">
                                        <img
                                            className="absolute inset-0 w-full h-full object-cover bg-gray-100 transition-transform duration-500 group-hover:scale-105"
                                            src={item.image}
                                            alt={item.alt}
                                            loading="lazy"
                                        />
                                    </div>
                                </div>

                                {/* Text Section */}
                                <div className="text-center mt-6 space-y-3">
                                    <h3 className="text-lg md:text-xl font-bold tracking-wide">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                                        {item.subtitle}
                                    </p>
                                    <button
                                        type="button"
                                        className="  px-6 py-4 border border-gray-600 rounded-4xl text-xs md:text-sm font-medium uppercase tracking-widest hover:bg-gray-800 hover:text-white transition-colors duration-300 mt-2"
                                    >
                                        {item.buttonText}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

    <section className="relative w-full bg-white">
      {/* Hero Container */}
      <div className="relative w-full overflow-hidden">
        <div className="relative w-full pt-[20.83%]"> {/* Aspect ratio */}
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              src="https://res.cloudinary.com/contentchef/video/upload/w_1980,q_auto,f_auto/thecorner-d377/PxDkkgi0ODy/PRODUCT%20FINDER/Product%20Finder%20ENG%202"
            />
          </div>

        </div>
      </div>
    </section>
        </>
    );
};

export default HeroSection;