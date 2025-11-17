import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import LoginPage from "../components/LoginPage";
import SignupPage from "../components/SignUpPage";
import { MapPin, Package, LogOut, User, ShoppingBag, ChevronRight, Plus, ArrowLeft } from 'lucide-react';

const UserAuth = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const { user, login, logout, signup, addresses, refreshAddresses, getToken } = useUser(); // Added getToken here

  const [formData, setFormData] = useState({
    login: { email: '', password: '' },
    signup: { name: '', email: '', password: '', phone: '' },
  });

  useEffect(() => {
    if (user) {
      // Refresh addresses when user logs in
      refreshAddresses();
      fetchUserOrders(); // Also fetch orders when user is available
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const userId = user?._id || user?.id;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

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
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/auth');
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0];
  };

  const defaultAddress = getDefaultAddress();

  if (user) {
    return (
      <div className="min-h-screen bg-white pt-30 pb-16 lg:pt-[250px]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
          @font-face {
            font-family: 'Didot';
            src: local('Didot'), local('Didot LT STD');
            font-weight: normal;
            font-style: normal;
          }
        `}</style>

        <div className="max-w-6xl mx-auto px-6">
                              <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Home</span>
            </button>
          </div>
          {/* Header */}
          <div className="text-center mb-12 border-b border-gray-200 pb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>My Account</h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-all duration-300 text-sm tracking-[0.2em] uppercase"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Section - User Info & Address */}
            <div className="space-y-8">
              {/* User Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-1" style={{ fontFamily: 'Didot, serif' }}>{user.name}</h2>
                    <p className="text-gray-600 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <p className="text-gray-600 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Phone: {user.phone}
                  </p>
                )}
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-gray-600" />
                  <h3 className="text-2xl font-light text-gray-900" style={{ fontFamily: 'Didot, serif' }}>Addresses</h3>
                </div>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {defaultAddress && (
                      <div className="border rounded-2xl p-5 shadow-sm transition-all border-black bg-gray-50">
                        {defaultAddress.isDefault && (
                          <span className="inline-block bg-black text-white text-[11px] px-2 py-0.5 rounded-full uppercase mb-2 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Default
                          </span>
                        )}
                        <h4 className="text-lg font-light text-gray-900 mb-3" style={{ fontFamily: 'Didot, serif' }}>
                          {defaultAddress.label || "Primary Address"}
                        </h4>
                        <div className="space-y-1">
                          <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            {defaultAddress.line1}
                          </p>
                          {defaultAddress.line2 && (
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {defaultAddress.line2}
                            </p>
                          )}
                          <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                          </p>
                          <p className="text-gray-600 text-xs mt-2 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {defaultAddress.country}
                          </p>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/addresses"
                      className="inline-flex items-center gap-2 text-black hover:text-gray-700 transition-all duration-300 text-lg"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      Manage all addresses ({addresses.length})
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      No addresses linked to your profile were found.
                    </p>
                    <Link
                      to="/addresses"
                      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 text-sm tracking-[0.2em] uppercase"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <Plus className="w-4 h-4" />
                      Create Address
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Order History */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-6 h-6 text-gray-600" />
                <h3 className="text-2xl font-light text-gray-900" style={{ fontFamily: 'Didot, serif' }}>Order History</h3>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Order #{order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-gray-600 text-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className="text-lg font-light text-gray-900" style={{ fontFamily: 'Didot, serif' }}>
                          Rs. {(order.totAmount || order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        } tracking-wide`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {order.orderStatus}
                        </span>
                        <Link
                          to="/orders"
                          className="text-black hover:text-gray-700 text-sm tracking-wide transition-all duration-300"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}

                  {orders.length > 3 && (
                    <Link
                      to="/orders"
                      className="inline-flex items-center gap-2 text-black hover:text-gray-700 transition-all duration-300 text-lg w-full justify-center py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      View all orders ({orders.length})
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    You haven't placed any orders yet.
                  </p>
                  <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Start shopping to see your order history here.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 text-sm tracking-[0.2em] uppercase"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup Forms
  return (
    <div className="min-h-screen bg-white pt-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>

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