import React, { useState } from 'react';

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
        <footer className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-6">
                    {/* Column 1 */}
                    <div className="flex-1">
                        <div className="space-y-3 text-center lg:text-left">
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Privacy Policy
                            </a>
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Cookies Policy
                            </a>
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Terms and Conditions
                            </a>
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                FAQs
                            </a>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="flex-1">
                        <div className="space-y-3 text-center lg:text-left">
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Contact Us
                            </a>
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Delivery
                            </a>
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Payment Methods
                            </a>
                            <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                                Returns
                            </a>
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="flex-1">
                        <div className="space-y-6 text-center lg:text-left">
                            <div>
                                <h3 className="text-sm font-medium tracking-wider uppercase mb-4">
                                    SIGN UP AND RECEIVE 15% DISCOUNT
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Receive first access to the very best of Thecorner.com products, inspiration and services.
                                </p>
                            </div>

                            <div>
                                {emailError && (
                                    <p className="text-red-500 text-xs italic mb-2">
                                        Please enter a valid email
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                    <input
                                        type="email"
                                        placeholder="Enter your email here"
                                        value={email}
                                        onChange={handleEmailChange}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                                        className="flex-1 bg-transparent border-b border-gray-600 py-2 px-0 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition italic"
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-transparent border border-white px-8 py-2 text-xs uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Section */}
                <div className="mt-10 flex flex-col lg:flex-row justify-between gap-6 text-center lg:text-left">
                    <div className="space-y-6">
                        <a href="#" className="block text-xs uppercase tracking-wider hover:opacity-70 transition">
                            About Us
                        </a>

                        <div className="space-y-2">
                            <a
                                href="https://www.instagram.com/thecornerdotcom_/"
                                target="_blank"
                                rel="noreferrer"
                                className="block text-xs lowercase hover:opacity-70 transition"
                            >
                                instagram
                            </a>
                            <a
                                href="https://www.facebook.com/thecornerdotcomofficial/"
                                target="_blank"
                                rel="noreferrer"
                                className="block text-xs lowercase hover:opacity-70 transition"
                            >
                                facebook
                            </a>
                        </div>
                        <div className="space-y-1 text-xs text-gray-400">
                            <p>THECORNER.COM S.r.l.</p>
                            <p>Via Carducci 32, 20123 Milano</p>
                            <p>P.Iva n. 06937930151</p>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
