// SuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const SuccessPage = () => {
  const [status, setStatus] = useState('Verifying payment...');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentId = params.get('transactionId') || 
                          params.get('merchantTransactionId') ||
                          params.get('paymentId');

        console.log('Payment verification started:', { paymentId, allParams: Object.fromEntries(params) });

        if (!paymentId) {
          setStatus('Payment completed! Thank you for your order.');
          setLoading(false);
          return;
        }

        // Verify payment status
        const res = await fetch(`${API_URL}/payments/status/${paymentId}`);
        const data = await res.json();
        
        console.log('Payment verification response:', data);

        if (data.success) {
          if (data.status === 'SUCCESS') {
            setStatus('Payment Successful!');
            setOrderDetails(data.order || data.payment);
          } else if (data.status === 'PENDING') {
            setStatus('Payment is being processed...');
          } else {
            setStatus('Payment Failed. Please try again.');
          }
        } else {
          setStatus('Payment completed! We are processing your order.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('Thank you for your order! Payment verification in progress.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [params, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 pt-[250px]">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Verifying your payment...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-[250px]">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        {status.includes('Successful') || status.includes('Thank you') ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">{status}</p>
            
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{orderDetails.orderId || orderDetails._id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">₹{orderDetails.amount?.toFixed(2) || orderDetails.totAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{status}</h1>
            <p className="text-gray-600 mb-6">We're processing your payment. You'll receive an update shortly.</p>
          </>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Link 
            to="/"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/orders"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            View Orders
          </Link>
          {status.includes('Failed') && (
            <Link 
              to="/checkout"
              className="px-6 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;