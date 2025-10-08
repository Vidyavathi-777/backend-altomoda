import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useParams } from "react-router-dom";

const ImageCarousel = () => {
  const {gender = 'woman'} = useParams()
  const swiperData = [
    {
      id: 1,
      title: "OUR BRANDS // DISCOVER NOW",
      image:
        "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_01_WOMAN_3",
        gender:"woman"
    },
    {
      id: 2,
      title: "OUR MAGAZINE // DISCOVER NOW TCZ",
      image:
      "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_02_WOMAN_3",
      gender:'woman'
    },

    {
      id: 3,
      title: "OUR BOUTIQUES // DISCOVER NOW",
      image:
        "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/BANNER%20BOUTIQUE/Footer_03_WOMAN_BOUTIQUE",
        gender:"woman"
    },
    {
      id: 4,
      title: "OUR BRANDS // DISCOVER NOW",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_01_MAN_3",
      gender:"man"
    },
    {
      id: 5,
      title: "OUR MAGAZINE // DISCOVER NOW TCZ",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/03_06_25/Footer_02_MAN_3",
      gender:"man"
    },
    {
      id: 6,
      title: "OUR BOUTIQUES // DISCOVER NOW",
      image: "https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/dZINQM1hh6m/BANNER%20BOUTIQUE/Footer_03_MAN_BOUTIQUE",
      gender:"man"
    }
  ];

  const slides = swiperData.filter(item => item.gender === gender)

  return (
    <div className="w-full bg-white py-8">
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
            delay: 4000, 
            disableOnInteraction: false 
          }}
          className="w-full"
        >
          {slides.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="w-full px-4">
                <div className="relative w-full">
                  {/* Image Container */}
                  <div className="h-0 pb-[140%] relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  {/* Title - Centered below image */}
                  <div className="mt-4 text-center">
                    <p className="text-[13px] font-normal tracking-[0.5px] text-gray-900 uppercase">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Mobile Pagination */}
        <div className="mobile-pagination flex justify-center space-x-1 mt-6" />
      </div>

      {/* Desktop Version */}
      <div className="hidden md:block max-w-6xl mx-auto">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={3}
          loop={true}
          autoplay={{ 
            delay: 5000, 
            disableOnInteraction: false 
          }}
          className="w-full"
        >
          {slides.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="w-full">
                <div className="relative w-full">
                  {/* Image Container */}
                  <div className="h-0 pb-[140%] relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Title - Centered below image */}
                  <div className="mt-4 text-center">
                    <p className="text-[13px] font-normal tracking-[0.5px] text-gray-900 uppercase">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx>{`
        /* Custom pagination dots */
        :global(.swiper-pagination-bullet) {
          width: 6px;
          height: 6px;
          background: #D1D5DB;
          opacity: 1;
          margin: 0 4px;
        }
        :global(.swiper-pagination-bullet-active) {
          background: #000000;
        }
      `}</style>
    </div>
  );
};

export default ImageCarousel;