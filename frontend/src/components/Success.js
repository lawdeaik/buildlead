import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyPurchase = async () => {
      const userId = searchParams.get('user_id'); // Whop passes this after purchase
      
      if (!userId) {
        // No user_id means they didn't come from Whop payment
        console.error('No user_id found in URL');
        setError(true);
        setVerifying(false);
        return;
      }

      try {
        // Call backend to verify with Whop API
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        const response = await fetch(`${API_URL}/api/verify-whop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (data.valid) {
          // Payment verified! Unlock access
          localStorage.setItem('buildlead_paid', 'true');
          localStorage.setItem('buildlead_uses', '999');
          localStorage.setItem('buildlead_whop_user', userId);
          setVerifying(false);
          
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          console.error('Verification failed:', data.error);
          setError(true);
          setVerifying(false);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(true);
        setVerifying(false);
      }
    };

    verifyPurchase();
  }, [navigate, searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Verifying Your Payment...
            </h1>
            <p className="text-xl text-gray-600">
              Please wait while we confirm your purchase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We couldn't verify your payment. Please contact support or try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/paywall')}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BuildLead Pro!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your payment was successful. You now have unlimited access to all lead magnet builders!
          </p>
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-8">
            <p className="text-gray-700 font-semibold">
              ✓ Unlimited Lead Magnets<br/>
              ✓ All 5 Builder Types<br/>
              ✓ Lifetime Access
            </p>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Redirecting you to the app in 3 seconds...
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700"
          >
            Start Building Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;