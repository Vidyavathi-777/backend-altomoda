import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import LoginPage from "../components/LoginPage";
import SignupPage from "../components/SignUpPage";
import AddressManagement from   './AddressManagement';

const UserAuth = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, logout, signup } = useUser();

  const [formData, setFormData] = useState({
    login: { email: '', password: '' },
    signup: { name: '', email: '', password: '', phone: '' },
  });

  const handleInputChange = (form, field, value) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      [form]: { ...prev[form], [field]: value },
    }));
  };

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const { email, password } = formData.login;
    const result = await login(email, password); 

    if (result.success) {
      setFormData({
        login: { email: '', password: '' },
        signup: formData.signup,
      });
    } else {
      setError(result.message || 'Invalid email or password');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};


const handleSignupSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const { name, email, password, phone } = formData.signup;
    const result = await signup(name, email, password, phone); 

    if (result.success) {
      setFormData({
        login: { email: '', password: '' },
        signup: { name: '', email: '', password: '', phone: '' },
      });
      setCurrentPage('login'); 
    } else {
      setError(result.message || 'Signup failed');
    }
  } catch (err) {
    console.error('Signup error:', err);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
    navigate('/login');
  };

  if (user) {
    return (<div className="max-w-4xl mx-auto px-4 py-12 sm:pt-[140px] md:pt-[160px] lg:pt-[250px]"> {/* Page title */} <h1 className="text-2xl md:text-3xl text-center font-medium mb-2">My account</h1> <button onClick={handleLogout} className="text-xl block mx-auto text-gray-600 underline hover:text-black mb-10" > Logout </button> <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10 md:gap-20 text-center md:text-left"> {/* Left Section - User Info + Address */} <div className="flex-1"> <div> <h2 className="text-2xl font-medium">{user.name}</h2> <p className="text-gray-600 text-xl mt-1">{user.email}</p> </div> <div className="mt-10"> <h3 className="text-2xl font-medium mb-2">Default address</h3> <p className="text-gray-600 text-xl mb-2"> No addresses linked to your profile were found, follow the link to add a new one. </p> <Link to='/addresses' className="text-lg text-black underline hover:text-gray-800"> Create address </Link> </div> </div> {/* Right Section - Order History */} <div className="flex-1"> <h3 className="text-2xl font-medium mb-2">Order history</h3> <p className="text-gray-600 text-lg">You haven’t placed orders yet.</p> </div> </div> </div>);
  }

  // ✅ Show login/signup
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {currentPage === 'login' && (
        <LoginPage
          formData={formData.login}
          onInputChange={(field, value) => handleInputChange('login', field, value)}
          onSubmit={handleLoginSubmit}
          onSwitchToSignup={() => {
            setCurrentPage('signup');
            setError('');
          }}
          error={error}
          loading={loading}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage
          formData={formData.signup}
          onInputChange={(field, value) => handleInputChange('signup', field, value)}
          onSubmit={handleSignupSubmit}
          onSwitchToLogin={() => {
            setCurrentPage('login');
            setError('');
          }}
          error={error}
          loading={loading}
        />
      )}
    </div>
  );
};

export default UserAuth;
