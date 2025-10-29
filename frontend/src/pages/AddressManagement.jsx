import React, { useState, useEffect } from 'react';
import { useUser } from "../Context/UserContext";

const AddressManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const {
    user,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getToken,
    refreshAddresses
  } = useUser();

  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialForm = {
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
    geo: { lat: '', lng: '' },
  };

  const [formData, setFormData] = useState(initialForm);

  // Load addresses on mount
  useEffect(() => {
    refreshAddresses();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        label: editingAddress.label || '',
        line1: editingAddress.line1 || '',
        line2: editingAddress.line2 || '',
        city: editingAddress.city || '',
        state: editingAddress.state || '',
        pincode: editingAddress.pincode || '',
        country: editingAddress.country || 'India',
        isDefault: !!editingAddress.isDefault,
        geo: {
          lat: editingAddress.geo?.lat ?? '',
          lng: editingAddress.geo?.lng ?? ''
        }
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingAddress]);

  const resetForm = () => {
    setEditingAddress(null);
    setFormData(initialForm);
    setError('');
    setSuccess('');
  };

  const safeAuthHeader = () => {
    const token = getToken();
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'lat' || name === 'lng') {
      setFormData(prev => ({ ...prev, geo: { ...prev.geo, [name]: value } }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const required = ['line1', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        setError(`Please fill required field: ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      const authHeader = safeAuthHeader();
      if (!authHeader) {
        setError('Auth token missing. Please sign in again.');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        pincode: String(formData.pincode).trim(),
        geo: {
          lat: formData.geo.lat !== '' ? Number(formData.geo.lat) : undefined,
          lng: formData.geo.lng !== '' ? Number(formData.geo.lng) : undefined,
        }
      };

      // Remove undefined geo values
      if (payload.geo.lat === undefined && payload.geo.lng === undefined) {
        delete payload.geo;
      }

      let res;
      if (editingAddress) {
        res = await fetch(`${API_URL}/v1/auth/me/addresses/${editingAddress._id}`, {
          method: 'PUT',
          headers: { 
            Authorization: authHeader, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/v1/auth/me/addresses`, {
          method: 'POST',
          headers: { 
            Authorization: authHeader, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json().catch(() => ({}));
      
      if (res.ok && result.status === 'success') {
        if (editingAddress) {
          await updateAddress(editingAddress._id, result.data);
          setSuccess('Address updated successfully!');
        } else {
          await addAddress(result.data);
          setSuccess('Address added successfully!');
        }
        resetForm();
        await refreshAddresses();
      } else if (res.status === 401) {
        setError('Unauthorized. Please login again.');
      } else {
        setError(result.message || `Failed to ${editingAddress ? 'update' : 'add'} address.`);
      }
    } catch (err) {
      console.error('handleSubmit error', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    
    setError('');
    setSuccess('');
    
    try {
      const authHeader = safeAuthHeader();
      if (!authHeader) {
        setError('Auth token missing. Please sign in again.');
        return;
      }

      const res = await fetch(`${API_URL}/v1/auth/me/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: authHeader, 
          'Content-Type': 'application/json' 
        }
      });

      const body = await res.json().catch(() => ({}));
      
      if (res.ok) {
        await deleteAddress(addressId);
        setSuccess('Address deleted successfully.');
        await refreshAddresses();
      } else if (res.status === 401) {
        setError('Unauthorized. Please login again.');
      } else {
        setError(body.message || 'Failed to delete address.');
      }
    } catch (err) {
      console.error('handleDeleteAddress error', err);
      setError('Failed to delete address. Please try again.');
    }
  };

  const handleSetDefault = async (addressId) => {
    setError('');
    setSuccess('');
    
    try {
      const authHeader = safeAuthHeader();
      if (!authHeader) {
        setError('Auth token missing. Please sign in again.');
        return;
      }

      const res = await fetch(`${API_URL}/v1/auth/me/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 
          Authorization: authHeader, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ isDefault: true }),
      });

      const body = await res.json().catch(() => ({}));
      
      if (res.ok && body.status === 'success') {
        await setDefaultAddress(addressId);
        setSuccess('Default address updated!');
        await refreshAddresses();
      } else if (res.status === 401) {
        setError('Unauthorized. Please login again.');
      } else {
        setError(body.message || 'Failed to set default address.');
      }
    } catch (err) {
      console.error('handleSetDefault error', err);
      setError('Failed to set default. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-[250px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input 
                    name="label" 
                    value={formData.label} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    placeholder="Home / Work (optional)" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input 
                    name="line1" 
                    required 
                    value={formData.line1} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    placeholder="Street address" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input 
                    name="line2" 
                    value={formData.line2} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    placeholder="Apartment, suite, etc. (optional)" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input 
                      name="city" 
                      required 
                      value={formData.city} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input 
                      name="state" 
                      required 
                      value={formData.state} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input 
                      name="pincode" 
                      required 
                      value={formData.pincode} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input 
                      type="checkbox" 
                      name="isDefault" 
                      checked={formData.isDefault} 
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-gray-500"
                      id="isDefault"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude (Optional)
                    </label>
                    <input 
                      name="lat" 
                      value={formData.geo.lat} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                      placeholder="e.g., 12.9716"
                      type="number"
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude (Optional)
                    </label>
                    <input 
                      name="lng" 
                      value={formData.geo.lng} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                      placeholder="e.g., 77.5946"
                      type="number"
                      step="any"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : (editingAddress ? 'UPDATE ADDRESS' : 'ADD ADDRESS')}
                  </button>
                  {editingAddress && (
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Addresses List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
              </div>

              <div className="p-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first address.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div 
                        key={address._id} 
                        className={`border rounded-lg p-4 transition-colors ${
                          address.isDefault 
                            ? 'border-green-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {address.isDefault && (
                          <span className="inline-flex px-2 py-0.5 text-xs bg-gray-600 text-white rounded-full font-medium mb-2">
                            Default
                          </span>
                        )}
                        <div className="text-sm text-gray-900 mt-2">
                          {address.label && (
                            <p className="font-semibold text-gray-900">{address.label}</p>
                          )}
                          <p className="mt-1">{address.line1}</p>
                          {address.line2 && <p>{address.line2}</p>}
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          {address.country && <p className="text-gray-600">{address.country}</p>}
                          {address.geo && (address.geo.lat || address.geo.lng) && (
                            <p className="text-xs text-gray-500 mt-1">
                              Coordinates: {address.geo.lat ?? '-'}, {address.geo.lng ?? '-'}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {!address.isDefault && (
                            <button 
                              onClick={() => handleSetDefault(address._id)} 
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Set as default
                            </button>
                          )}
                          <button 
                            onClick={() => setEditingAddress(address)} 
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(address._id)} 
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressManagement;