import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError(true);
            return;
        }
        setEmailError(false);
        console.log('Subscribed:', email);
        setEmail('');
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) setEmailError(false);
    };

    return (
        <footer className="bg-black text-white border-t border-gray-800">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
                
                @font-face {
                    font-family: 'Didot';
                    src: local('Didot'), local('Didot LT STD');
                    font-weight: normal;
                    font-style: normal;
                }

                .logo-animation {
                    animation: float 3s ease-in-out infinite;
                }

                .logo-glow {
                    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.1));
                    transition: all 0.5s ease;
                }

                .logo-glow:hover {
                    filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.3));
                    transform: scale(1.05);
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }

                .gold-gradient {
                    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .border-gold {
                    border-color: #D4AF37;
                }

                .hover-gold:hover {
                    color: #D4AF37;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-8 py-16">
                {/* Main Footer Content - 4 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Column 1 - Policies */}
                    <div className="space-y-4">
                        <h3 className="text-lg tracking-[0.3em] uppercase mb-6 text-gray-400"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Policies
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/privacyPolicy"
                                className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                            >
                                Privacy Policy
                            </Link>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Cookies Policy
                            </a>
                            <Link
                                to="/terms&conditions"
                                className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                            >
                                Terms and Conditions
                            </Link>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                FAQs
                            </a>
                        </div>
                    </div>

                    {/* Column 2 - Services */}
                    <div className="space-y-4">
                        <h3 className="text-lg tracking-[0.3em] uppercase mb-6 text-gray-400"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Services
                        </h3>
                        <div className="space-y-3">
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Contact Us
                            </a>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Delivery
                            </a>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Payment Methods
                            </a>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Returns
                            </a>
                        </div>
                    </div>

                    {/* Column 3 - Company */}
                    <div className="space-y-4">
                        <h3 className="text-lg tracking-[0.3em] uppercase mb-6 text-gray-400"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Company
                        </h3>
                        <div className="space-y-3">
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                About Us
                            </a>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Careers
                            </a>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Press
                            </a>
                            <a href="#" className="block text-lg tracking-wider hover-gold transition-all duration-300 hover:translate-x-1"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Sustainability
                            </a>
                        </div>
                    </div>

                    {/* Column 4 - Newsletter */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm tracking-[0.3em] uppercase mb-4 text-gray-400"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Join Our World
                            </h3>
                            <p className="text-lg leading-relaxed text-gray-300 mb-6"
                               style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                Receive first access to exclusive collections, private sales, and luxury insights.
                            </p>
                        </div>

                        <div>
                            {emailError && (
                                <p className="text-red-400 text-xs italic mb-3 tracking-wider"
                                   style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    Please enter a valid email address
                                </p>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="w-full bg-transparent border-b border-gray-600 py-3 px-0 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all duration-300 italic tracking-wider"
                                    style={{ fontFamily: 'Didot, serif' }}
                                />
                                <button
                                    type="submit"
                                    className="w-full border border-gold text-gold px-8 py-4 text-xs uppercase tracking-widest hover:bg-gold hover:text-black hover:bg-white transition-all duration-300 rounded-sm"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-12"></div>

                {/* Lower Section */}
                <div className="flex flex-col lg:flex-row justify-between items-center text-white gap-8">
                     <div></div>
                    {/* Company Info */}
                    {/* <div className="text-center lg:text-left space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-center lg:justify-start space-x-6 ">
                                <a
                                    href="https://www.instagram.com/thecornerdotcom_/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-lg tracking-wider hover-gold transition-all duration-300 "
                                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                                >
                                    Instagram
                                </a>
                                <a
                                    href="https://www.facebook.com/thecornerdotcomofficial/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-lg tracking-wider hover-gold transition-all duration-300"
                                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                                >
                                    Facebook
                                </a>
                            </div>
                        </div>
                        <div className="space-y-1 text-sm text-white tracking-wider"
                             style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <p>THEALTOMODA.COM S.r.l.</p>
                            <p>Via Carducci 32, 20123 Milano</p>
                            <p>P.Iva n. 06937930151</p>
                        </div>
                    </div> */}

                    {/* ALTOMODA Logo */}
                    <div className="flex-shrink-0">
                        <div className="logo-animation logo-glow">
                            <h1 className="text-4xl  font-light tracking-widest gold-gradient"
                                style={{ fontFamily: 'Didot, serif' }}>
                                ALTOMODA
                            </h1>
                            {/* <p className="text-xs tracking-[0.5em] text-gray-400 text-center mt-2 uppercase"
                               style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                MILANO
                            </p> */}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center mt-12 pt-8 border-t border-gray-800">
                    <p className="text-xs tracking-widest text-white uppercase"
                       style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        © 2025 ALTOMODA. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;