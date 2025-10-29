import React from 'react';

const SignupPage = ({ formData, onInputChange, onSubmit, onSwitchToLogin, error }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <h2 className="text-4xl text-center font-light mb-8">Subscribe</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name:</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Your name..."
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address:</label>
          <input
            type="email"
            className="w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Your email..."
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password:</label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Choose your password..."
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number:</label>
          <input
            type="tel"
            className="w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Your phone number..."
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors duration-300"
        >
          SIGN UP
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={onSwitchToLogin}
          className="text-sm underline hover:text-gray-700 transition-colors duration-300"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
};

export default SignupPage;