import React, { useState, useEffect } from 'react';
import { useCart } from "../Context/CartContext";
import { useUser } from "../Context/UserContext";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CreditCard, ArrowLeft, Check, Plus, X, Edit2, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
  const { cart, loading: cartLoading } = useCart();
  const { user, addresses, getToken, refreshAddresses } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
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
  };
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  // Handle payment retry from SuccessPage
  useEffect(() => {
    if (location.state?.retryPayment && location.state?.orderId) {
      setCurrentStep(3);
      setOrderDetails({ _id: location.state.orderId });
    }
  }, [location.state]);

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
    if (type === 'checkbox') {
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

      const url = editingAddress 
        ? `${API_URL}/v1/auth/me/addresses/${editingAddress._id}`
        : `${API_URL}/v1/auth/me/addresses`;
      
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: authHeader, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      
      if (res.ok && result.status === 'success') {
        await refreshAddresses();
        setSelectedAddress(result.data);
        setShowAddressForm(false);
        setEditingAddress(null);
        setFormData(initialForm);
      } else {
        setError(result.message || 'Failed to save address.');
      }
    } catch (err) {
      setError('Failed to save address. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India',
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleCancelEdit = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setFormData(initialForm);
    setError('');
  };

  // STEP 2: Create Order (when user clicks on shipping step)
  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    setOrderLoading(true);
    setError('');

    try {
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const orderPayload = {
        items: cart.items.map(item => ({
          sku: item.sku,
          quantity: item.qty,
          price: item.priceSnapshot,
          name: item.product?.title || 'Product'
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

      // Order created successfully, move to payment step
      setOrderDetails(orderResult.data);
      setCurrentStep(3);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setOrderLoading(false);
    }
  };

  // STEP 3: Initiate Payment (when user clicks Pay Now)
  const handleInitiatePayment = async () => {
    if (!orderDetails) {
      setError('Order details not found');
      return;
    }

    setPaymentLoading(true);
    setError('');

    try {
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const payRes = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          orderId: orderDetails._id,
          amount: orderDetails.totAmount,
        }),
      });

      const payResult = await payRes.json();
      
      if (!payRes.ok || !payResult.success) {
        throw new Error(payResult.message || 'Payment initialization failed');
      }

      const redirectUrl = payResult.data?.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="mb-12">
      <div className="flex items-center justify-center max-w-2xl mx-auto">
        {[
          { num: 1, label: 'Information', active: currentStep === 1, completed: currentStep > 1 },
          { num: 2, label: 'Shipping', active: currentStep === 2, completed: currentStep > 2 },
          { num: 3, label: 'Payment', active: currentStep === 3, completed: currentStep > 3 }
        ].map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div className={`text-sm font-medium mb-2 ${
                step.active || step.completed ? 'text-black' : 'text-gray-400'
              }`}>
                {step.label}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed ? 'bg-black text-white' :
                step.active ? 'bg-black text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step.completed ? <Check className="w-4 h-4" /> : step.num}
              </div>
            </div>
            {index < 2 && (
              <div className={`w-32 h-0.5 mx-4 ${
                step.completed ? 'bg-black' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const InformationStep = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
        <h2 className="text-lg font-bold">Contact & Address</h2>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
          <span className="text-sm font-medium">Contact</span>
          <span className="text-sm text-gray-600">{user?.email}</span>
        </div>
        
        {!showAddressForm ? (
          <>
            <div className="mb-4">
              <span className="text-sm font-medium block mb-3">Shipping address</span>
              
              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  <span className="text-xs text-gray-500 block">Saved addresses:</span>
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address)}
                      className={`border rounded-md p-4 cursor-pointer transition-all ${
                        selectedAddress?._id === address._id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {address.label && (
                            <p className="font-medium text-sm mb-1">{address.label}</p>
                          )}
                          <p className="text-sm text-gray-700">{address.line1}</p>
                          {address.line2 && <p className="text-sm text-gray-700">{address.line2}</p>}
                          <p className="text-sm text-gray-700">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{address.country}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {selectedAddress?._id === address._id && (
                            <Check className="w-4 h-4 text-black" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-3 px-4 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedAddress}
              className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Shipping
            </button>
          </>
        ) : (
          <form onSubmit={handleAddNewAddress} className="space-y-4">
            <h3 className="font-medium mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label (optional)
              </label>
              <input 
                name="label" 
                value={formData.label} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Home / Work" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input 
                name="line1" 
                required 
                value={formData.line1} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Street address" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 (optional)
              </label>
              <input 
                name="line2" 
                value={formData.line2} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Apartment, suite, etc." 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input 
                  name="state" 
                  required 
                  value={formData.state} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input 
                  name="pincode" 
                  required 
                  value={formData.pincode} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input 
                  name="country" 
                  value={formData.country} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors text-sm bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Set as default address</label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
              >
                {formLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
              </button>
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const ShippingStep = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
        <h2 className="text-lg font-bold">Review & Create Order</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2 text-sm">Shipping To:</h3>
        <p className="text-sm text-gray-700">{selectedAddress?.line1}</p>
        {selectedAddress?.line2 && <p className="text-sm text-gray-700">{selectedAddress.line2}</p>}
        <p className="text-sm text-gray-700">
          {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
        </p>
        <p className="text-xs text-gray-500 mt-1">{selectedAddress?.country}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-md">
          <div>
            <span className="font-medium">Standard Shipping</span>
          </div>
          <span className="font-bold">€50.00</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Return to information
        </button>
        <button
          onClick={handleCreateOrder}
          disabled={!selectedAddress || orderLoading}
          className="flex-1 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {orderLoading ? 'Creating Order...' : 'Create Order'}
        </button>
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
        <h2 className="text-lg font-bold">Payment</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {orderDetails && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Order Created Successfully!</span>
          </div>
          <p className="text-sm text-green-700">
            Order ID: #{orderDetails._id?.slice(-8).toUpperCase() || 'N/A'}
          </p>
        </div>
      )}

      <div className="text-center mb-6">
        <p className="text-gray-600 mb-4">Complete your payment to confirm the order</p>
        <button
          onClick={handleInitiatePayment}
          disabled={paymentLoading}
          className="w-full bg-black text-white py-4 rounded-md font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {paymentLoading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Secure payment processed by our payment partner
      </div>
    </div>
  );

  const OrderSummary = () => (
    <div className="bg-white rounded-lg border border-gray-300 p-6 sticky top-24">
      <h2 className="text-lg font-bold mb-6 border-b border-gray-200 pb-4">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {cart?.items?.map((item) => (
          <div key={item.sku} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium text-sm">{item.product?.title}</div>
              <div className="text-xs text-gray-500">Size: {item.size || item.product?.size || 'TU'}</div>
              {item.originalPrice && item.originalPrice > item.priceSnapshot ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 line-through">
                    €{item.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-black">
                    €{item.priceSnapshot.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-sm font-bold mt-1">€{item.priceSnapshot.toFixed(2)}</div>
              )}
            </div>
            <div className="text-sm text-gray-500">Qty: {item.qty}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({cart?.totalItems || 0} items)</span>
          <span className="font-semibold">€{cart?.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold">€50.00</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
          <span>Total</span>
          <span>€{((cart?.subtotal || 0) + 50).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-2">
          <p className="font-semibold">IMPORTANT NOTICE</p>
          <p>
            Taxes and customs duties are not included and may be charged upon delivery. 
            When the courier contacts you in order to pay the duties and you refuse the shipment, 
            return costs and any other cost related to the return (including duties) will be 
            deducted from the refund amount.
          </p>
        </div>
      </div>
    </div>
  );

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12 pt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 font-heading">ALTOMODA.COM</h1>
          <StepIndicator />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && <InformationStep />}
            {currentStep === 2 && <ShippingStep />}
            {currentStep === 3 && <PaymentStep />}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;