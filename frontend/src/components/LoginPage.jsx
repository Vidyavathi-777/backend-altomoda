import React from 'react';

const LoginPage = ({ formData, onInputChange, onSubmit, onSwitchToSignup, error }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:pt-[140px] md:pt-[160px] lg:pt-[250px]">
      <h2 className="text-2xl font-bold mb-8">Log in</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email address</label>
          <input 
            type="email" 
            className="w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Enter email ..."
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input 
            type="password" 
            className="w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Insert password..."
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors duration-300"
        >
          COME IN
        </button>
      </form>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-bold mb-4">New client?</h3>
        <p className="text-sm text-gray-600 mb-6">
          Create an account to get numerous benefits, have access to your order list and have your data ready for your next purchases.
        </p>
        <button 
          onClick={onSwitchToSignup}
          className="bg-gray-300 text-gray-600 font-medium py-3 px-6 hover:bg-gray-800 hover:text-white transition-colors duration-300"
        >
          CREATE ACCOUNT
        </button>
      </div>
    </div>
  );
};

export default LoginPage;