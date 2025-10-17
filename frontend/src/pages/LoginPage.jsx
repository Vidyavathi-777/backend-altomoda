// App.js
import React, { useState } from 'react';

const UserLogin = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [formData, setFormData] = useState({
    login: {
      email: '',
      password: ''
    },
    signup: {
      name: '',
      surname: '',
      email: '',
      password: '',
      country: '',
      marketing: false,
      privacy: false
    }
  });

  const handleInputChange = (form, field, value) => {
    setFormData(prev => ({
      ...prev,
      [form]: {
        ...prev[form],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      signup: {
        ...prev.signup,
        [field]: !prev.signup[field]
      }
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData.login);
    alert('Login form submitted!');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!formData.signup.privacy) {
      alert('Please accept the Privacy Policy and Terms & Conditions');
      return;
    }
    console.log('Signup data:', formData.signup);
    alert('Signup form submitted!');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">IHE JUKINEK. LUIM</div>
            <nav className="hidden md:flex space-x-6 text-sm">
              {['Designers', 'New Arrivals', 'Woman', 'Man', 'Boutiques', 'Up To 50% Off', 'TCZ, TheCorreZine', 'Product Finder'].map((item) => (
                <a key={item} href="#" className="relative hover:after:content-[''] hover:after:absolute hover:after:w-full hover:after:h-0.5 hover:after:bg-black hover:after:bottom-[-4px] hover:after:left-0 transition-all duration-300">
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentPage('login')}
                className="text-sm font-medium"
              >
                Log in
              </button>
              <button 
                onClick={() => setCurrentPage('signup')}
                className="text-sm font-medium"
              >
                Sign up
              </button>
              <button className="md:hidden">
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Login Page */}
      {currentPage === 'login' && (
        <LoginPage 
          formData={formData.login}
          onInputChange={(field, value) => handleInputChange('login', field, value)}
          onSubmit={handleLoginSubmit}
          onSwitchToSignup={() => setCurrentPage('signup')}
        />
      )}

      {/* Signup Page */}
      {currentPage === 'signup' && (
        <SignupPage 
          formData={formData.signup}
          onInputChange={(field, value) => handleInputChange('signup', field, value)}
          onCheckboxChange={handleCheckboxChange}
          onSubmit={handleSignupSubmit}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}
    </div>
  );
};

// Login Page Component
const LoginPage = ({ formData, onInputChange, onSubmit, onSwitchToSignup }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12  sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <h2 className="text-2xl font-bold mb-8">Log in</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email address</label>
          <input 
            type="email" 
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
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
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Insert password..."
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
          />
        </div>
        
        {/* <div className="text-sm text-gray-500 mb-6">
          <a href="mailto:liuim@ihejukinek.com" className="underline">
            Name password Tutorial name
          </a>
        </div> */}
        
        <button 
          type="submit" 
          className=" bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors duration-300"
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
          className=" bg-gray-300 text-gray-600 font-medium py-3 px-6 hover:bg-gray-800  hover:text-white transition-colors duration-300"
        >
          CREATE ACCOUNT
        </button>
      </div>
    </div>
  );
};

// Signup Page Component
const SignupPage = ({ formData, onInputChange, onCheckboxChange, onSubmit, onSwitchToLogin }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12  sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <h2 className="text-4xl text-center font-light mb-8">Subscribe</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name:</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Your name..."
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Surname:</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Your surname..."
            value={formData.surname}
            onChange={(e) => onInputChange('surname', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email Address:</label>
          <input 
            type="email" 
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
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
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            placeholder="Choose your password..."
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Country:</label>
          <select 
            className="w-full border border-gray-300 py-2 focus:border-black focus:outline-none transition-colors duration-300"
            value={formData.country}
            onChange={(e) => onInputChange('country', e.target.value)}
          >
            <option value="">SELECT...</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>
        
        <div className="flex items-start space-x-2">
          <div 
            className={`w-5 h-5 border border-gray-300 flex items-center justify-center cursor-pointer transition-colors duration-300 ${
              formData.marketing ? 'bg-black text-white' : ''
            }`}
            onClick={() => onCheckboxChange('marketing')}
          >
            {formData.marketing && <span className="text-xs">✓</span>}
          </div>
          <label className="text-sm text-gray-700 cursor-pointer flex-1">
            No, I would like to move the best offers and product now via ads shown on digital media based on my interaction.
          </label>
        </div>
        
        <div className="flex items-start space-x-2">
          <div 
            className={`w-5 h-5 border border-gray-300 flex items-center justify-center cursor-pointer transition-colors duration-300 ${
              formData.privacy ? 'bg-black text-white' : ''
            }`}
            onClick={() => onCheckboxChange('privacy')}
          >
            {formData.privacy && <span className="text-xs">✓</span>}
          </div>
          <label className="text-sm text-gray-700 cursor-pointer flex-1">
            I have read and accept the Privacy Policy and the Conditional Skills.
          </label>
        </div>
        
        <button 
          type="submit" 
          className=" bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors duration-300"
        >
          SIGN IN
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

export default UserLogin;