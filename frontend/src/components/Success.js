import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Mark as paid in localStorage
    localStorage.setItem('buildlead_paid', 'true');
    localStorage.setItem('buildlead_uses', '999');
    
    // Redirect to home after 3 seconds
    setTimeout(() => {
      navigate('/');
    }, 3000);
  }, [navigate]);

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
          <p className="text-gray-500 text-sm">
            Redirecting you to the app in 3 seconds...
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700"
          >
            Start Building Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;