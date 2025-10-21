import React from 'react';
import { useNavigate } from 'react-router-dom';

const Paywall = () => {
  const navigate = useNavigate();

  const handlePurchase = () => {
    // Redirect to Whop checkout
    window.location.href = 'https://whop.com/checkout/plan_3K6z9JF9ht5oU?d2c=true';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Unlimited Lead Magnets
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You've used your 1 free lead magnets. Upgrade to Pro for unlimited access!
          </p>

          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-8 mb-8">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              $37
              <span className="text-2xl text-gray-600 font-normal"> one-time</span>
            </div>
            <p className="text-gray-600">Lifetime access. No recurring fees.</p>
          </div>

          <div className="text-left mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-teal-600 text-xl">✓</div>
              <div>
                <div className="font-semibold text-gray-900">Unlimited Lead Magnets</div>
                <div className="text-sm text-gray-600">Create as many as you want, forever</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-teal-600 text-xl">✓</div>
              <div>
                <div className="font-semibold text-gray-900">All 5 Magnet Types</div>
                <div className="text-sm text-gray-600">Value Calculators, Quizzes, Checklists, Scorecards, PDF Guides</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-teal-600 text-xl">✓</div>
              <div>
                <div className="font-semibold text-gray-900">Proven Frameworks</div>
                <div className="text-sm text-gray-600">Hormozi & Priestley methodologies built-in</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-teal-600 text-xl">✓</div>
              <div>
                <div className="font-semibold text-gray-900">All Niches Supported</div>
                <div className="text-sm text-gray-600">SaaS, Coaching, Ecommerce, Finance & More</div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg mb-4"
          >
            Upgrade to Pro - $37
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Paywall;