import React from "react";
import Header from "../components/Homepage.jsx/Header";
import HeroSection from "../components/Homepage.jsx/HeroSection";
import Newsletter from "../components/Homepage.jsx/NewsLetter";
import NewArrivals from "../components/Homepage.jsx/NewArrivals";
import ImageCarousel from "../components/Homepage.jsx/ImageCarousel";
import BrandsSection from "../components/Homepage.jsx/BrandsSection";


const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Header />
      </header>

      {/* Main Content */}
      <main className="pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
        <HeroSection />
        <NewArrivals />
        <Newsletter />
        <ImageCarousel />
        <BrandsSection />
        
      </main>
    </div>
  );
};

export default HomePage;
