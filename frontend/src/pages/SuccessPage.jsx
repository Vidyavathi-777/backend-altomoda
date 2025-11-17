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
      <div className="min-h-screen bg-white flex items-center justify-center pt-32 px-4">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md w-full">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-2 border-gray-200 border-t-black mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>Verifying Payment</h2>
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  const renderSuccessState = () => (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32 px-4 lg:pt-[250px]">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>Payment Successful!</h1>
        <p className="text-xl text-gray-600 mb-10" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Your order has been placed successfully
        </p>

        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-8 mb-10 text-left border border-gray-200">
            <h3 className="font-light text-xl text-gray-900 mb-6" style={{ fontFamily: 'Didot, serif' }}>Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Order ID</span>
                <span className="font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  #{orderDetails.orderId?.slice(-8).toUpperCase() || orderDetails._id?.slice(-8).toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Payment ID</span>
                <span className="font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {orderDetails.paymentId?.slice(-12) || paymentId?.slice(-12) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-900 font-medium tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount Paid</span>
                <span className="text-3xl font-light text-gray-900" style={{ fontFamily: 'Didot, serif' }}>
                  €{(orderDetails.amount || orderDetails.totAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-10 text-left">
          <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            <strong className="font-semibold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>What's next?</strong> You'll receive an order confirmation email shortly. 
            Track your order status in the Orders section.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/orders"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium tracking-[0.2em] uppercase text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            View My Orders
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/"
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium tracking-[0.2em] uppercase text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  const renderPendingState = () => (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32 px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl w-full">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
        
        <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>Payment Processing</h1>
        <p className="text-xl text-gray-600 mb-10" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Your payment is being verified
        </p>

        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-8 mb-10 text-left border border-gray-200">
            <h3 className="font-light text-xl text-gray-900 mb-6" style={{ fontFamily: 'Didot, serif' }}>Order Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Order ID</span>
                <span className="font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  #{orderDetails.orderId?.slice(-8).toUpperCase() || orderId?.slice(-8).toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-600 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amount</span>
                <span className="text-3xl font-light text-gray-900" style={{ fontFamily: 'Didot, serif' }}>
                  €{(orderDetails.amount || orderDetails.totAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-10 text-left">
          <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            <strong className="font-semibold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Please note:</strong> Your order has been created and is awaiting payment confirmation. 
            You'll receive an update once the payment is processed. Check your order status in the Orders section.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium tracking-[0.2em] uppercase text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Refresh Status
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link 
            to="/orders"
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium tracking-[0.2em] uppercase text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );

  const renderFailedState = () => (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32 px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Didot, serif' }}>Payment Failed</h1>
        <p className="text-xl text-gray-600 mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          We couldn't process your payment
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{error}</p>
          </div>
        )}

        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-10 text-left">
          <p className="text-gray-700 leading-relaxed mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            <strong className="font-semibold tracking-wide block mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>What happened?</strong>
            Your payment couldn't be completed. This could be due to insufficient funds, 
            incorrect payment details, or a technical issue. Please try again or use a different payment method.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetryPayment}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium tracking-[0.2em] uppercase text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Try Payment Again
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link 
            to="/cart"
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium tracking-[0.2em] uppercase text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Back to Cart
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p style={{ fontFamily: 'Cormorant Garamond, serif' }}>If the problem persists, please contact our support team.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>
      {paymentStatus === 'success' && renderSuccessState()}
      {paymentStatus === 'pending' && renderPendingState()}
      {paymentStatus === 'failed' && renderFailedState()}
    </div>
  );
};

export default SuccessPage;