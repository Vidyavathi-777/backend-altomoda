import React from 'react'
import { useRef } from "react";
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import banner1 from "../../assets/banner1.mp4"
import banner2 from "../../assets/bannere2.mp4"
import banner3 from  "../../assets/banner3.webp"
import banner4 from "../../assets/banner4.mp4"
import { Link, useParams } from 'react-router-dom';


const BannerCarousel = () => {
    const { gender = 'woman' } = useParams();
        const navitems = {
        man: "68f86b10734810ab97bb98d1",
        woman: "68f86b1c734810ab97bb9a2f"
    };
    const Banner1 = () => {
        return (
            <div className="banner relative w-full h-[80vh] md:h-[90vh] lg:h-[100vh] overflow-hidden  bg-black">
                <style>
                    {`
                     
                    `}
                </style>
                {/* Background Video */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover object-center"
                    src={banner1}
                    // src="https://zyra-theme-demo.myshopify.com/cdn/shop/videos/c/vp/832377d9c14e445fb3e5aacadcb4d016/832377d9c14e445fb3e5aacadcb4d016.HD-1080p-7.2Mbps-63222283.mp4?v=0"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="absolute inset-0 bg-black/10 md:bg-black/5" />
                {/* MAIN CONTENT */}
                <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-10 lg:px-20">
                    <div className="flex justify-between items-center w-full">
                        {/* LEFT TITLE */}
                        <motion.div
                            initial={{ x: -80, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="max-w-[600px]"
                            style={{
                                fontFamily: "Cormorant Garamond, Didot, serif",
                            }}
                        >
                            <h1
                                className="text-white font-light lg:leading-16  leading-10
              text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[68px]"
                            >
                                Trendy <span className="italic">Styles</span> for Every <br />
                                Season Shop Today.
                            </h1>
                        </motion.div>
                        {/* RIGHT DESCRIPTION + BUTTON */}
                        <motion.div
                            initial={{ x: 80, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                            className="hidden md:flex flex-col items-start max-w-[260px] text-white space-y-5"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                            <p className="text-[16px]  leading-relaxed opacity-90">
                                Explore trendy styles perfect for every season.
                                Shop now and elevate your look with effortless fashion.
                            </p>
                            <Link
                                to={`/woman/68f86b1c734810ab97bb9a2f/products`}
                                className="bg-white text-black px-6 py-2 text-sm uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                            >
                                Explore
                                {/* <span className="text-lg transition-transform group-hover:translate-x-1">
                                    →
                                </span> */}
                            </Link>
                        </motion.div>
                    </div>
                    {/* MOBILE ONLY */}
                    <motion.div
                        initial={{ y: 70, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
                        className="mt-6 md:hidden flex flex-col max-w-[250px] text-white space-y-4"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        <p className="text-sm leading-relaxed   opacity-90">
                            Explore trendy styles perfect for every season. Shop now and elevate your look.
                        </p>
                        <Link
                        to={`/woman/68f86b1c734810ab97bb9a2f/products`}
                          className="bg-white text-black px-6 py-2 text-xs uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                        >
                            Explore
                            {/* <span className="text-lg transition-transform group-hover:translate-x-1">
                                →
                            </span> */}
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    const Banner2 = () => {
        return (
            <div className="relative w-full h-[80vh] md:h-[90vh] lg:h-[100vh] overflow-hidden bg-black">
                {/* VIDEO */}
                <video
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    src={banner2}
                    // src="https://prestige-theme-allure.myshopify.com/cdn/shop/videos/c/vp/a9ea64c362124ba0b6ffc37ea30bc5c8/a9ea64c362124ba0b6ffc37ea30bc5c8.HD-1080p-4.8Mbps-13664080.mp4?v=0"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="absolute inset-0 bg-black/25" />
                {/* CONTENT */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-5"
                >
                    <h2
                        className="text-xl sm:text-2xl lg:text-3xl uppercase tracking-[3px] opacity-80 mb-4"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        New Arrivals
                    </h2>
                    <h1
                       className="text-white font-light lg:leading-16  leading-10 max-w-[1000px]
              text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[68px] mb-8"
                        style={{ fontFamily: 'Cormorant Garamond, Didot, serif' }}
                    >Where craftsmanship meets style — discover the season’s most elegant arrivals
                    </h1>
                    <Link
                        to={`/${gender}/${navitems[gender]}/new-arrivals/products`}
                       className="bg-white text-black px-6 py-2 text-sm uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        Shop New Arrivals
                    </Link>
                </motion.div>
            </div>
        );
    }

    const Banner3 = () => {
        return (
            <div className="relative w-full h-[80vh] md:h-[90vh] lg:h-[100vh] overflow-hidden bg-black">
                {/* Background Image */}
                <img
                    src={banner3}
                    // src="https://demo-store-mini-pollheim-suits.myshopify.com/cdn/shop/files/ebc2057bc08cefc76b244662058c8e45f241b288_1.png?v=1753859675&width=1468"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    alt="Men's style banner"
                />
                <div className="absolute inset-0 bg-black/10 md:bg-black/5" />
                {/* CONTENT WRAPPER */}
                <div className="absolute inset-0 flex flex-col justify-center -mt-[100px] px-6 md:px-12 lg:px-20">
                    {/* LEFT CONTENT BLOCK */}
                    <motion.div
                        initial={{ x: -80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="max-w-[600px]"
                        style={{
                            fontFamily: "Cormorant Garamond, Didot, serif",
                        }}
                    >
                        <h1 className="text-white font-light leading-tight 
            text-[36px] sm:text-[44px] md:text-[54px] lg:text-[62px]">
                            Step Into Style
                        </h1>
                    </motion.div>
                    {/* Subtitle + Button */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="mt-4 space-y-6 text-white max-w-[500px]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        <p className="text-sm sm:text-base opacity-90 leading-relaxed">
                            Find the perfect pair of shoes to elevate your suit — sleek, polished,
                            and always on point.
                        </p>
                        <Link
                            to={`/man/68f86b10734810ab97bb98d1/products`}
                          className="bg-white text-black px-6 py-2 text-sm uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                        >
                            Shop
                            {/* <span className="text-lg transition-transform group-hover:translate-x-1">
                                →
                            </span> */}
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    const Banner4 = () => {
        return (
            <div className="relative w-full h-[80vh] md:h-[90vh] lg:h-[100vh] overflow-hidden bg-black">
                {/* Main video */}
                <video
                    src={banner4}
                    // src="https://salt-yard.myshopify.com/cdn/shop/videos/c/vp/b42735ce926c4f26b654969110400208/b42735ce926c4f26b654969110400208.HD-720p-1.6Mbps.mp4?v=0"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/30 z-[6]" />
                {/* Centered Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-[10]"
                >
                    <h1
                        className="text-white font-light lg:leading-16  leading-10
              text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[68px] mb-4"
                        style={{ fontFamily: "Cormorant Garamond, Didot, serif" }}
                    >
                        Effortless design. <br className="hidden sm:block" />
                        Iconic brands.
                    </h1>
                    <p
                        className="text-white/90 text-sm sm:text-base mb-8"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        Fresh new styles you'll wear on repeat.
                    </p>
                    {/* Buttons */}
                    <div className="flex gap-4">
                        {/* <button
                           className="bg-white text-black px-6 py-2 text-sm uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                            Shop now
                        </button> */}
                        <Link
                            to={`/${gender}/designers`}      
                            className="bg-white text-black px-6 py-2 text-sm uppercase 
            hover:bg-black hover:text-white border border-white transition-all"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                            Shop the collection
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    const banners = [<Banner1 />, <Banner2 />, <Banner3 />, <Banner4 />];
    // const banners = [<Banner2/>]

    return (
        <div className="relative w-full">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                slidesPerView={1}
                loop={true}
                effect="fade"
                speed={900}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true, // ⬅️ stops when user hovers
                }}
                navigation={{
                    nextEl: ".next-btn",
                    prevEl: ".prev-btn",
                }}
                pagination={{
                    el: ".banner-pagination",
                    clickable: true,
                }}
                simulateTouch={true} // ⬅️ Enables hand scroll/drag
                grabCursor={true} // ⬅️ Shows grab hand icon while dragging
                className="w-full h-full"
            >
                {banners.map((banner, i) => (
                    <SwiperSlide key={i}>{banner}</SwiperSlide>
                ))}
            </Swiper>

            {/* Arrows */}
            <button className="prev-btn absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
                &#10094;
            </button>

            <button className="next-btn absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
                &#10095;
            </button>

            {/* Dots */}
            <div className="banner-pagination absolute bottom-5 left-1/2 -translate-x-1/2 z-20"></div>
        </div>
    )
}

export default BannerCarousel