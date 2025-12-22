import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ImageCarousel = () => {
  const { gender = 'woman' } = useParams();
      const navitems = {
        man: "68f86b10734810ab97bb98d1",
        woman: "68f86b1c734810ab97bb9a2f"
    };

  const navigate = useNavigate();

  
  const swiperData = [
    {
      id: 1,
      title: "OUR BRANDS // DISCOVER NOW",
      type: "brands",
      subtitle: "Curated Excellence",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_01_WOMAN_3",
      gender: "woman"
    },
    {
      id: 2,
      title: "OUR MAGAZINE // DISCOVER NOW TCZ",
      type: "magazine",
      subtitle: "Editorial Insights",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_02_WOMAN_3",
      gender: 'woman'
    },
    {
      id: 3,
      title: "OUR BOUTIQUES // DISCOVER NOW",
      type: "boutiques",
      subtitle: "Exceptional Service",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/BANNER%20BOUTIQUE/Footer_03_WOMAN_BOUTIQUE",
      gender: "woman"
    },
    {
      id: 4,
      title: "OUR BRANDS // DISCOVER NOW",
      type: "brands",
      subtitle: "Curated Excellence",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_01_MAN_3",
      gender: "man"
    },
    {
      id: 5,
      title: "OUR MAGAZINE // DISCOVER NOW TCZ",
      type: "magazine",
      subtitle: "Editorial Insights",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_02_MAN_3",
      gender: "man"
    },
    {
      id: 6,
      title: "OUR BOUTIQUES // DISCOVER NOW",
      type: "boutiques",
      subtitle: "Exceptional Service",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/BANNER%20BOUTIQUE/Footer_03_MAN_BOUTIQUE",
      gender: "man"
    }
  ];

  const linkRoutes = {
  brands: `/${gender}/designers`,
  magazine: `/magazine`,
  boutiques: `/boutique`,
};


  const slides = swiperData.filter(item => item.gender === gender);

  return (
    <div className="w-full bg-white py-16 md:py-24 border-t border-gray-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }

        .luxury-gradient {
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
        }

        .gold-border {
          border: 1px solid #D4AF37;
        }

        .luxury-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Custom pagination */
        .custom-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #D1D5DB;
          opacity: 0.6;
          margin: 0 6px;
          transition: all 0.3s ease;
        }

        .custom-pagination .swiper-pagination-bullet-active {
          background: #000;
          opacity: 1;
          transform: scale(1.2);
        }

        /* Navigation buttons */
        .nav-button {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background: white;
          border-color: #000;
          transform: scale(1.05);
        }
      `}</style>

      {/* Mobile Version */}
      <div className="block md:hidden">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          pagination={{ 
            clickable: true,
            el: '.mobile-pagination',
          }}
          autoplay={{ 
            delay: 5000, 
            disableOnInteraction: false 
          }}
          className="w-full"
        >
          {slides.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="w-full px-6">
                <div  onClick={() => navigate(linkRoutes[item.type])}
                className="relative w-full luxury-shadow rounded-lg overflow-hidden">
                  {/* Image Container */}
                  <div className="h-0 pb-[120%] relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 luxury-gradient opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-[11px] tracking-[0.3em] uppercase mb-2 opacity-90"
                       style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {item.subtitle}
                    </p>
                    <h3 className="text-lg font-light tracking-wide mb-3"
                        style={{ fontFamily: 'Didot, serif' }}>
                      {item.title.split('//')[0].trim()}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {item.title.split('//')[1].trim()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Mobile Pagination */}
        <div className="mobile-pagination custom-pagination flex justify-center space-x-2 mt-8" />
      </div>

      {/* Desktop Version */}
      <div className="hidden md:block relative">
        <div className="max-w-7xl mx-auto px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-wider mb-4"
                style={{ fontFamily: 'Didot, serif' }}>
              Discover More
            </h2>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Explore our world of luxury craftsmanship and exclusive experiences
            </p>
          </div>

          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={40}
            slidesPerView={3}
            loop={true}
            autoplay={{ 
              delay: 6000, 
              disableOnInteraction: false 
            }}
            navigation={{
              nextEl: '.custom-next',
              prevEl: '.custom-prev',
            }}
            className="w-full"
          >
            {slides.map((item) => (
              <SwiperSlide key={item.id}>
                <div  onClick={() => navigate(linkRoutes[item.type])}
                className="group cursor-pointer">
                  <div className="relative w-full luxury-shadow rounded-sm overflow-hidden">
                    {/* Image Container */}
                    <div className="h-0 pb-[140%] relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 luxury-gradient opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      
                      {/* Hover Content */}
                      <div className="absolute inset-0 flex items-end p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <div className="text-white">
                          <p className="text-[11px] tracking-[0.3em] uppercase mb-3 opacity-90"
                             style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {item.subtitle}
                          </p>
                          <h3 className="text-2xl font-light tracking-wide mb-4 leading-tight"
                              style={{ fontFamily: 'Didot, serif' }}>
                            {item.title.split('//')[0].trim()}
                          </h3>
                          <button className="text-[12px] tracking-[0.2em] uppercase border border-white px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
                                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {item.title.split('//')[1].trim()}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Default Content */}
                    <div className="absolute bottom-8 left-8 right-8 text-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <p className="text-[12px] tracking-[0.3em] uppercase text-gray-600 mb-2"
                         style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {item.subtitle}
                      </p>
                      <h3 className="text-lg font-light tracking-wide text-black"
                          style={{ fontFamily: 'Didot, serif' }}>
                        {item.title.split('//')[0].trim()}
                      </h3>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button className="custom-prev nav-button w-12 h-12 rounded-full flex items-center justify-center luxury-shadow">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button className="custom-next nav-button w-12 h-12 rounded-full flex items-center justify-center luxury-shadow">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;