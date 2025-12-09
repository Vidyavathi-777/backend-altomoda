import React, { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';
import { Search, Filter, Package, Truck, Clock, XCircle, ChevronRight, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate()

  const { getToken, user } = useUser();
  const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const userId = user?._id || user?.id;

      const res = await fetch(`${API_URL}/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      const token = getToken();
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
      } else {
        setError(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to fetch order details');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Clock,
        label: 'Pending',
        progress: 25
      },
      CONFIRMED: {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: Package,
        label: 'Confirmed',
        progress: 50
      },
      SHIPPED: {
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        icon: Truck,
        label: 'Shipped',
        progress: 75
      },
      DELIVERED: {
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: Package,
        label: 'Delivered',
        progress: 100
      },
      CANCELED: {
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: XCircle,
        label: 'Canceled',
        progress: 0
      },
      PARTIALLY_SHIPPED: {
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        icon: Truck,
        label: 'Partially Shipped',
        progress: 65
      },
    };
    return configs[status] || { 
      color: 'text-gray-600 bg-gray-50 border-gray-200', 
      icon: Package, 
      label: status, 
      progress: 0 
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount) => {
    if (!amount) return '€0.00';
    return new Intl.NumberFormat('en-IE', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amount);
  };

  // Filter and search
  const filteredOrders = orders
    .filter(order => statusFilter === 'ALL' || order.orderStatus === statusFilter)
    .filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const orderId = order._id?.toLowerCase() || '';
      const totalAmount = order.totAmount || order.totalAmount || 0;
      return orderId.includes(searchLower) || 
             totalAmount.toString().includes(searchLower);
    });

  // Get first product image from order
  const getFirstProductImage = (order) => {
    const firstItem = order.items?.[0];
    if (firstItem?.productDetails?.image) {
      return firstItem.productDetails.image;
    }
    if (firstItem?.productDetails?.images?.[0]) {
      return firstItem.productDetails.images[0];
    }
    return null;
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Loading your orders...</p>
      </div>
    </div>
  );

  if (error && orders.length === 0) return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-light text-gray-900 mb-2" style={{ fontFamily: 'Didot, serif' }}>Unable to Load Orders</h3>
        <p className="text-gray-600 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{error}</p>
        <button 
          onClick={fetchOrders}
          className="w-full bg-black text-white py-3 rounded-lg font-medium tracking-[0.2em] uppercase text-sm hover:bg-gray-800 transition-all duration-300"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-8 pt-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6 lg:pt-[180px]">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-8">
                    <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Home</span>
            </button>
          </div>

          <h1 className="text-4xl font-light text-gray-900 mb-3" style={{ fontFamily: 'Didot, serif' }}>My Orders</h1>
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Track and manage all your orders</p>
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {filteredOrders.length} of {orders.length} orders
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Total Orders</p>
              <p className="text-2xl font-light text-black" style={{ fontFamily: 'Didot, serif' }}>{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID or Amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all duration-300 text-sm bg-white"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all duration-300 bg-white min-w-[180px] text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="PARTIALLY_SHIPPED">Partially Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const StatusIcon = statusConfig.icon;
            const totalAmount = order.totAmount || order.totalAmount || 0;
            const productImage = getFirstProductImage(order);
            
            return (
              <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ">
                {/* Order Header */}
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-6">
                      {/* Product Image */}
                      <div className="relative">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt="Product"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center ${productImage ? 'hidden' : 'flex'} ${statusConfig.color}`}>
                          <Package className="w-8 h-8" />
                        </div>
                        
                        {/* Status Badge on Image */}
                        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} backdrop-blur-sm`}>
                          {statusConfig.label}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-light text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Didot, serif' }}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-gray-500 text-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          Placed on {formatDate(order.createdAt || order.orderDt)}
                        </p>
                        <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: 'Didot, serif' }}>
                          {formatCurrency(totalAmount)}
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedOrder?._id === order._id) {
                            setSelectedOrder(null);
                          } else {
                            fetchOrderById(order._id);
                          }
                        }}
                        className={`p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 ${
                          selectedOrder?._id === order._id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <ChevronRight className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
                          selectedOrder?._id === order._id ? 'rotate-90' : ''
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-gray-700 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Order Progress</span>
                      <span className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{statusConfig.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-black to-gray-700 transition-all duration-1000 ease-out"
                        style={{ width: `${statusConfig.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-3 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <span>Ordered</span>
                      <span>Confirmed</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder?._id === order._id && selectedOrder && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-8">
                      {/* Shipping Address */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4">
                          <MapPin className="w-6 h-6 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-light text-xl text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>Shipping Address</h4>
                            <p className="text-gray-600 text-lg mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {selectedOrder.shippingInfo?.address || 'Address not available'}
                            </p>
                            <p className="text-gray-600 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state} - {selectedOrder.shippingInfo?.pincode}
                            </p>
                            <p className="text-gray-600 text-lg mt-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {selectedOrder.shippingInfo?.country || 'India'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <h4 className="font-light text-xl text-gray-900 mb-6" style={{ fontFamily: 'Didot, serif' }}>Order Items</h4>
                        <div className="space-y-4">
                          {selectedOrder.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              {item.productDetails?.image ? (
                                <img 
                                  src={item.productDetails.image} 
                                  alt={item.productDetails.title || item.name}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-20 h-20 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center" style={{ display: item.productDetails?.image ? 'none' : 'flex' }}>
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-light text-lg text-gray-900 mb-1" style={{ fontFamily: 'Didot, serif' }}>
                                  {item.productDetails?.title || item.name || 'Product'}
                                </p>
                                {item.productDetails?.brand && (
                                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {item.productDetails.brand}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-gray-500 text-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                  <span>Qty: {item.quantity || item.qty || 1}</span>
                                  {item.productDetails?.size && item.productDetails.size !== 'N/A' && (
                                    <>
                                      <span>•</span>
                                      <span>Size: {item.productDetails.size}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-light text-xl text-gray-900 mb-1" style={{ fontFamily: 'Didot, serif' }}>
                                  {formatCurrency(item.price * (item.quantity || item.qty || 1))}
                                </p>
                                <p className="text-sm text-gray-500" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                  {formatCurrency(item.price)} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <h4 className="font-light text-xl text-gray-900 mb-6" style={{ fontFamily: 'Didot, serif' }}>Price Details</h4>
                        <div className="space-y-4 text-lg">
                          <div className="flex justify-between">
                            <span className="text-gray-600" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Subtotal ({selectedOrder.totQty || selectedOrder.items?.length || 0} items)</span>
                            <span className="text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{formatCurrency(selectedOrder.totAmount || selectedOrder.totalAmount || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Shipping Charges</span>
                            <span className="text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>€50.00</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-4">
                            <span className="font-light text-xl text-gray-900" style={{ fontFamily: 'Didot, serif' }}>Total Amount</span>
                            <span className="font-light text-2xl text-gray-900" style={{ fontFamily: 'Didot, serif' }}>
                              {formatCurrency((selectedOrder.totAmount || selectedOrder.totalAmount || 0) + 50)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <button className="flex-1 min-w-[140px] px-6 py-4 bg-black text-white rounded-lg text-sm font-medium tracking-[0.2em] uppercase hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-3"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <Truck className="w-4 h-4" />
                          Track Order
                        </button>
                        <button className="flex-1 min-w-[140px] px-6 py-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium tracking-[0.2em] uppercase hover:bg-gray-50 transition-all duration-300"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          View Invoice
                        </button>
                        <button className="flex-1 min-w-[140px] px-6 py-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium tracking-[0.2em] uppercase hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <Phone className="w-4 h-4" />
                          Help
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>
              {searchTerm || statusFilter !== 'ALL' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start shopping and your orders will appear here!'}
            </p>
            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="bg-black text-white px-8 py-4 rounded-lg font-medium tracking-[0.2em] uppercase text-sm hover:bg-gray-800 transition-all duration-300"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                View All Orders
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;