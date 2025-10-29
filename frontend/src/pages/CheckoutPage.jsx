import React, { useState, useEffect } from 'react';
import { useCart } from "../Context/CartContext";
import { useUser } from "../Context/UserContext";

const CheckoutPage = () => {
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, addresses, getToken, refreshAddresses } = useUser();
  const [currentStep, setCurrentStep] = useState('information');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

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
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    refreshAddresses();
  }, []);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(addr => addr.isDefault);
      setSelectedAddress(defaultAddr || addresses[0]);
    }
  }, [addresses]);

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

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setError('');

    const required = ['line1', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        setError(`Please fill required field: ${field}`);
        return;
      }
    }

    setFormLoading(true);
    try {
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const payload = {
        ...formData,
        pincode: String(formData.pincode).trim(),
        geo: {
          lat: formData.geo.lat !== '' ? Number(formData.geo.lat) : undefined,
          lng: formData.geo.lng !== '' ? Number(formData.geo.lng) : undefined,
        }
      };

      if (payload.geo.lat === undefined && payload.geo.lng === undefined) {
        delete payload.geo;
      }

      const res = await fetch(`${API_URL}/v1/auth/me/addresses`, {
        method: 'POST',
        headers: { 
          Authorization: authHeader, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (res.ok && result.status === 'success') {
        await refreshAddresses();
        setSelectedAddress(result.data);
        setShowAddressForm(false);
        setFormData(initialForm);
      } else {
        setError(result.message || 'Failed to add address.');
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setOrderLoading(true);
    setError('');

    try {
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

      // 1️⃣ Create Order
      const orderPayload = {
        items: cart.items.map(item => ({
          sku: item.sku,
          quantity: item.qty,
          price: item.priceSnapshot
        })),
        shippingInfo: {
          address: `${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}`,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country
        },
        billingInfo: {
          address: `${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}`,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country
        },
        additionalInfo: {
          notes: ''
        }
      };

      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 
          Authorization: authHeader, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(orderPayload),
      });

      const orderResult = await orderRes.json();
      
      if (!orderRes.ok || !orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      const createdOrder = orderResult.data;
      setOrderDetails(createdOrder);

      // 2️⃣ Initiate Payment
      const payRes = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          orderId: createdOrder._id,
          amount: createdOrder.totAmount,
        }),
      });

      const payResult = await payRes.json();
      
      if (!payRes.ok || !payResult.success) {
        throw new Error(payResult.message || 'Payment initialization failed');
      }

      const redirectUrl = payResult.data?.redirectUrl;
      
      if (redirectUrl) {
        // Clear cart before redirecting to payment
        try {
          await clearCart();
        } catch (clearErr) {
          console.error('Error clearing cart:', clearErr);
        }
        
        // Redirect to PhonePe payment page
        window.location.href = redirectUrl;
      } else {
        throw new Error('No redirect URL received from payment gateway');
      }

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Don't show success page here anymore - it will be handled by SuccessPage component
  // after payment completion

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-[250px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">THE CORNER.COM</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mt-4">
            <span className={currentStep === 'information' ? 'font-semibold text-gray-900' : ''}>Information</span>
            <span className="text-gray-300">&gt;</span>
            <span className={currentStep === 'shipping' ? 'font-semibold text-gray-900' : ''}>Shipping</span>
            <span className="text-gray-300">&gt;</span>
            <span className={currentStep === 'payment' ? 'font-semibold text-gray-900' : ''}>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">{user?.email || 'guest@example.com'}</p>
                <button className="text-sm text-blue-600 hover:underline">Sign out</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping address</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {!showAddressForm ? (
                <>
                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saved addresses
                      </label>
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => setSelectedAddress(address)}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedAddress?._id === address._id
                              ? 'border-green-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {address.label && (
                                <p className="font-semibold text-gray-900 mb-1">{address.label}</p>
                              )}
                              <p className="text-sm text-gray-700">{address.line1}</p>
                              {address.line2 && <p className="text-sm text-gray-700">{address.line2}</p>}
                              <p className="text-sm text-gray-700">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-gray-600">{address.country}</p>
                            </div>
                            {selectedAddress?._id === address._id && (
                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Add new address
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label (optional)
                    </label>
                    <input 
                      name="label" 
                      value={formData.label} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                      placeholder="Home / Work" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
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
                      Apartment, suite, etc. (optional)
                    </label>
                    <input 
                      name="line2" 
                      value={formData.line2} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
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
                        PIN code *
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

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleAddNewAddress}
                      disabled={formLoading}
                      className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {formLoading ? 'Saving...' : 'Save Address'}
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddressForm(false);
                        setFormData(initialForm);
                        setError('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!showAddressForm && (
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || orderLoading || cartLoading}
                className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>

          <div className="lg:pl-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartLoading ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading cart...</p>
                ) : cart?.items && cart.items.length > 0 ? (
                  cart.items.map((item) => (
                    <div key={item.sku} className="flex gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center">
                          {item.qty}
                        </div>
                        <img 
                          src={item.image || '/api/placeholder/64/64'} 
                          alt={item.name || 'Product'} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.name || 'Product'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {item.size || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          €{(item.priceSnapshot * item.qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Your cart is empty</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal · {cart?.totalItems || 0} items</span>
                  <span className="font-medium text-gray-900">€{cart?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">€50.00</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    <span className="text-xs text-gray-500 mr-1">EUR</span>
                    €{((cart?.subtotal || 0) + 50).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">IMPORTANT NOTICE</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Taxes and customs duties are not included and may be charged upon delivery.
                  When the courier contacts you in order to pay the duties and you refuse the shipment, 
                  return costs and any other cost related to the return (including duties) will be 
                  deducted from the refund amount.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;