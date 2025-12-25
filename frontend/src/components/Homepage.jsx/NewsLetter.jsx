import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    console.log('Email submitted:', email);
    setEmail('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="bg-white w-full flex justify-center  px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row w-full max-w-[1200px] gap-6 md:gap-12">
        
        {/* Image Banner */}
        <div className="w-full md:w-1/2 h-auto">
          <a
            href="https://www.instagram.com/thecornerdotcom_/"
            target="_blank"
            rel="noreferrer"
            className="block w-full h-full"
          >
            <img
              className="w-full h-auto object-cover rounded-md"
              src="https://res.cloudinary.com/contentchef/image/upload/w_450,q_auto,dpr_1,f_auto/thecorner-d377/PxDkkgi0ODy/FOLLOW%20US/BANNER_IG_HOME_SET_2025_ENG_NEW"
              alt="Banner"
            />
          
          </a>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center px-2 sm:px-4 md:px-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wide uppercase text-black text-center md:text-left mb-4 md:mb-6 leading-tight">
            Sign up and receive 15% discount
          </h2>

          {error && (
            <em className="block text-red-500 text-sm mb-3 text-center md:text-left italic">
              {error}
            </em>
          )}

          <form className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email here"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-md uppercase font-medium text-base hover:bg-gray-900 transition-colors"
            >
              Subscribe
            </button>
          </form>

          <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left leading-tight">
            This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
