import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useUser } from '../Context/UserContext';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const SuccessPage = () => {
  const [paymentStatus, setPaymentStatus] = useState('loading'); // loading, success, failed, pending
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;
  const { clearCart, clearLocalCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, getToken } = useUser();
  const token = getToken();

  // Get payment parameters
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  const handleRetryPayment = () => {
    if (orderId) {
      // Navigate to checkout with order ID to retry payment (goes to step 3 - Payment)
      navigate('/checkout', { 
        state: { 
          orderId: orderId,
          retryPayment: true 
        } 
      });
    } else {
      // If no order ID, go to cart to start over
      navigate('/cart');
    }
  };

const safeClearCart = async () => {
  try {
    await clearCart(); // Will always succeed and clear local state
  } catch (err) {
    console.warn('Could not clear cart on server, clearing local state:', err);
    clearLocalCart(); // Fallback (though clearCart already does this)
  }
};

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('Verifying payment with ID:', paymentId);

        if (!paymentId && !orderId) {
          setPaymentStatus('failed');
          setError('Missing payment information');
          setLoading(false);
          return;
        }

        // If we have status from URL params, use that directly
        if (status === 'success') {
          setPaymentStatus('success');
          // Clear cart on success
          await safeClearCart();
          setLoading(false);
          return;
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          setLoading(false);
          return;
        }

        // Otherwise verify with backend
        const verifyUrl = paymentId 
          ? `${API_URL}/payments/status/${paymentId}`
          : `${API_URL}/payment-status/${paymentId}/${orderId}`;

        const res = await fetch(verifyUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        
        console.log('Payment verification response:', data);

        if (data.success) {
          const paymentStatus = data.status || data.paymentStatus;
          
          if (paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED') {
            setPaymentStatus('success');
            setOrderDetails(data);
            // Clear cart on success
            await safeClearCart();
          } else if (paymentStatus === 'PENDING' || paymentStatus === 'PROCESSING') {
            setPaymentStatus('pending');
            setOrderDetails(data);
            // Clear cart even for pending payments
            await safeClearCart();
          } else {
            setPaymentStatus('failed');
            setOrderDetails(data);
            setError(data.message || 'Payment failed');
            // Don't clear cart for failed payments
          }
        } else {
          setPaymentStatus('failed');
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setPaymentStatus('failed');
        setError('Unable to verify payment status. Please check your order history.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, orderId, status, API_URL, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-32 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  const renderSuccessState = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center pt-[250px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl w-full">

        
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your order has been placed successfully
        </p>

        {orderDetails && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono font-semibold text-gray-900 bg-white px-3 py-1 rounded-lg">
                  #{orderDetails.orderId?.slice(-8).toUpperCase() || orderDetails._id?.slice(-8).toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-mono font-medium text-gray-700">
                  {orderDetails.paymentId?.slice(-12) || paymentId?.slice(-12) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Amount Paid</span>
                <span className="text-2xl font-bold text-green-600">
                  €{(orderDetails.amount || orderDetails.totAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8 text-left">
          <p className="text-sm text-blue-800">
            <strong>What's next?</strong> You'll receive an order confirmation email shortly. 
            Track your order status in the Orders section.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/orders"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg"
          >
            View My Orders
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/"
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  const renderPendingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center pt-[250px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl w-full">
        
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Processing</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your payment is being verified
        </p>

        {orderDetails && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono font-semibold text-gray-900">
                  #{orderDetails.orderId?.slice(-8).toUpperCase() || orderId?.slice(-8).toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  €{(orderDetails.amount || orderDetails.totAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-8 text-left">
          <p className="text-sm text-yellow-800">
            <strong>Please note:</strong> Your order has been created and is awaiting payment confirmation. 
            You'll receive an update once the payment is processed. Check your order status in the Orders section.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg"
          >
            Refresh Status
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link 
            to="/orders"
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );

  const renderFailedState = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center pt-[250px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl w-full">

        
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Failed</h1>
        <p className="text-xl text-gray-600 mb-4">
          We couldn't process your payment
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 text-left">
          <p className="text-sm text-red-800 mb-2">
            <strong>What happened?</strong>
          </p>
          <p className="text-sm text-red-700">
            Your payment couldn't be completed. This could be due to insufficient funds, 
            incorrect payment details, or a technical issue. Please try again or use a different payment method.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetryPayment}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg"
          >
            Try Payment Again
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link 
            to="/cart"
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            Back to Cart
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>If the problem persists, please contact our support team.</p>
        </div>
      </div>
    </div>
  );

  if (paymentStatus === 'success') return renderSuccessState();
  if (paymentStatus === 'pending') return renderPendingState();
  if (paymentStatus === 'failed') return renderFailedState();

  return null;
};

export default SuccessPage;