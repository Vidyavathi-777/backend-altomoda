import React, { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';
import { Search, Filter, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, MapPin, Phone } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { getToken, user } = useUser();
  const API_URL = import.meta.env.VITE_API_URL;

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
        icon: CheckCircle,
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
        icon: CheckCircle,
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
      currency: 'EUR',
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

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    </div>
  );

  if (error && orders.length === 0) return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchOrders}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50  pb-8 pt-[250px]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage all your orders</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-black">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID or Amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white min-w-[150px]"
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
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const StatusIcon = statusConfig.icon;
            const totalAmount = order.totAmount || order.totalAmount || 0;
            
            return (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg border-2 ${statusConfig.color} flex items-center justify-center`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Placed on {formatDate(order.createdAt || order.orderDt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(totalAmount)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedOrder?._id === order._id) {
                            setSelectedOrder(null);
                          } else {
                            fetchOrderById(order._id);
                          }
                        }}
                        className={`p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors ${
                          selectedOrder?._id === order._id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${
                          selectedOrder?._id === order._id ? 'rotate-90' : ''
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Order Progress</span>
                      <span className="text-sm text-gray-500">{statusConfig.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-black to-gray-700 transition-all duration-500"
                        style={{ width: `${statusConfig.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Ordered</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder?._id === order._id && selectedOrder && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      {/* Shipping Address */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                            <p className="text-gray-600 text-sm">
                              {selectedOrder.shippingInfo?.address || 'Address not available'}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state} - {selectedOrder.shippingInfo?.pincode}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {selectedOrder.shippingInfo?.country || 'India'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              {item.productDetails?.image ? (
                                <img 
                                  src={item.productDetails.image} 
                                  alt={item.productDetails.title || item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center" style={{ display: item.productDetails?.image ? 'none' : 'flex' }}>
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.productDetails?.title || item.name || 'Product'}
                                </p>
                                {item.productDetails?.brand && (
                                  <p className="text-xs text-gray-500 uppercase font-semibold">
                                    {item.productDetails.brand}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
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
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency(item.price * (item.quantity || item.qty || 1))}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(item.price)} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal ({selectedOrder.totQty || selectedOrder.items?.length || 0} items)</span>
                            <span className="text-gray-900">{formatCurrency(selectedOrder.totAmount || selectedOrder.totalAmount || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping Charges</span>
                            <span className="text-gray-900">€50.00</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold text-gray-900">Total Amount</span>
                            <span className="font-bold text-lg text-gray-900">
                              {formatCurrency((selectedOrder.totAmount || selectedOrder.totalAmount || 0) + 50)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Order Info */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Status</span>
                            <span className={`font-medium ${statusConfig.color.split(' ')[0]}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          {selectedOrder.buyerEmail && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email</span>
                              <span className="text-gray-900">{selectedOrder.buyerEmail}</span>
                            </div>
                          )}
                          {selectedOrder.buyerName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name</span>
                              <span className="text-gray-900">{selectedOrder.buyerName}</span>
                            </div>
                          )}
                          {selectedOrder.shopOrderId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shop Order ID</span>
                              <span className="text-gray-900 font-mono text-xs">{selectedOrder.shopOrderId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-6">
                        <button className="flex-1 min-w-[120px] px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2">
                          <Truck className="w-4 h-4" />
                          Track Order
                        </button>
                        <button className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                          View Invoice
                        </button>
                        <button className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
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
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
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