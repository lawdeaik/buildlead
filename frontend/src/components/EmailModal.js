import React, { useState } from 'react';

const EmailModal = ({ onSubmit, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Better email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const CONVERTKIT_API_KEY = 'KQU_r3ZaWEjALcbJZmqM-w'; // Public API key
      const CONVERTKIT_FORM_ID = '8682905'; // Verify this in dashboard > Forms > Settings > Form ID

      console.log('Attempting to send email to ConvertKit...');

      const response = await fetch(`https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: CONVERTKIT_API_KEY,
          email: email,
        }),
      });

      const data = await response.json();
      console.log('ConvertKit response FULL:', data); // Log full object for debugging

      if (response.ok && data.success) {
        console.log('✅ Email added to ConvertKit successfully');
        onSubmit(email);
      } else {
        console.error('❌ ConvertKit error:', data);
        setError(data.message || 'Subscription failed. Please try again.');
        onSubmit(email); // Save locally on error
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Network error. Email saved locally.');
      onSubmit(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free Trial</h2>
          <p className="text-gray-600">Enter your email to create your first lead magnet</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="you@example.com"
              required
              autoFocus
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Start Building →'}
          </button>
          <p className="text-xs text-gray-500 text-center">We'll send you tips on creating better lead magnets. Unsubscribe anytime.</p>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-900 mb-2"><strong>🎁 Bonus:</strong> Get early access to AI features</p>
            <p className="text-xs text-purple-700">Join our waitlist and be first to try AI-powered content generation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;