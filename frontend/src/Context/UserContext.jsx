import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Set token in localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Fetch user profile and addresses
  const fetchUserProfile = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_URL}/v1/auth/me`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setUser(result.data);
          setAddresses(result.data.addresses || []);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh addresses from server
  const refreshAddresses = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_URL}/v1/auth/me`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setAddresses(result.data.addresses || []);
        }
      }
    } catch (error) {
      console.error('Failed to refresh addresses:', error);
    }
  };

  // Add new address to local state
  const addAddress = async (newAddress) => {
    setAddresses(prev => [...prev, newAddress]);
  };

  // Update address in local state
  const updateAddress = async (addressId, updatedAddress) => {
    setAddresses(prev => 
      prev.map(addr => addr._id === addressId ? updatedAddress : addr)
    );
  };

  // Delete address from local state
  const deleteAddress = async (addressId) => {
    setAddresses(prev => prev.filter(addr => addr._id !== addressId));
  };

  // Set default address in local state
  const setDefaultAddress = async (addressId) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }))
    );
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setToken(result.data.token);
        setUser(result.data.user);
        await fetchUserProfile();
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  // Signup function
  const signup = async (name, email, password, phone) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, phone })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setToken(result.data.token);
        await fetchUserProfile();
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  // Logout function
  const logout = async () => {
    const token = getToken();
    
    if (token) {
      try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        await fetch(`${API_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  // Load user on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value = {
    user,
    addresses,
    loading,
    login,
    signup,
    logout,
    getToken,
    refreshAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};