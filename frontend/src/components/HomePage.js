import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const HomePage = ({ usesRemaining, isPaid }) => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>BuildLead - AI-Powered Lead Magnet Creator | Create in Minutes</title>
        <meta name="description" content="AI-powered lead magnet builder using proven frameworks from Alex Hormozi and Daniel Priestley. Create value calculators, quizzes, checklists, scorecards, and ebooks with AI. Try free now." />
        <meta name="keywords" content="AI lead magnet builder, lead generation tool, Alex Hormozi value equation, Daniel Priestley scorecard, AI content generator, business lead generation, marketing automation" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buildlead.xyz/" />
        <meta property="og:title" content="BuildLead - AI-Powered Lead Magnet Creator" />
        <meta property="og:description" content="AI-powered lead magnet builder using proven frameworks from Alex Hormozi and Daniel Priestley. Try free now." />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://buildlead.xyz/" />
        <meta property="twitter:title" content="BuildLead - AI-Powered Lead Magnets" />
        <meta property="twitter:description" content="AI-powered lead magnet builder using proven frameworks from Alex Hormozi and Daniel Priestley." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BuildLead",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "37.00",
              "priceCurrency": "USD"
            },
            "description": "AI-powered lead magnet builder using proven frameworks from Alex Hormozi and Daniel Priestley",
            "operatingSystem": "Web",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "ratingCount": "1"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
        {/* NEW: AI-Powered Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center text-sm">
          ✨ <strong>NEW:</strong> AI-Powered Content Generation Now Live!
        </div>

        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                BuildLead
              </h1>
              {!isPaid && usesRemaining === 1 && (
                <div className="text-sm text-orange-600 font-semibold">
                  🎁 1 free use available
                </div>
              )}
              {!isPaid && usesRemaining === 0 && (
                <div className="text-sm text-red-600 font-semibold">
                  Free trial used
                </div>
              )}
              {isPaid && (
                <div className="text-sm font-semibold text-teal-600">
                  ✓ Pro Account
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* NEW: AI Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span className="animate-pulse">✨</span>
              AI-Powered
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Create High-Converting
              <span className="block bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Lead Magnets in Minutes
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered lead magnet builder with proven frameworks from Alex Hormozi and Daniel Priestley. 
              Generate professional content instantly, then customize and download.
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              {usesRemaining > 0 && !isPaid ? 'Try Free Now →' : 'Start Building Now →'}
            </button>
            {!isPaid && usesRemaining > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                Try 1 AI-generated lead magnet free • No credit card required • Then $37 for unlimited
              </p>
            )}
          </div>
        </section>

        {/* NEW: AI Benefits Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">How AI Supercharges Your Lead Magnets</h3>
              <p className="text-gray-600">Click "Generate with AI" and watch it create content in seconds</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-bold text-gray-900 mb-2">10x Faster</h4>
                <p className="text-sm text-gray-600">Generate complete content in 10 seconds vs 2 hours manually</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-bold text-gray-900 mb-2">Framework-Driven</h4>
                <p className="text-sm text-gray-600">AI trained on Hormozi & Priestley methodologies</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">✏️</div>
                <h4 className="font-bold text-gray-900 mb-2">Fully Editable</h4>
                <p className="text-sm text-gray-600">AI generates, you customize - perfect every time</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
            5 Powerful Lead Magnet Types
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Each builder has AI-powered content generation with proven conversion frameworks
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  🧮
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">✨ AI</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Value Calculator</h4>
              <p className="text-gray-600">
                AI generates calculations using Alex Hormozi's Value Equation framework.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  ✅
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">✨ AI</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Interactive Quiz</h4>
              <p className="text-gray-600">
                AI creates 10 qualifying questions with answer keys instantly.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  📋
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">✨ AI</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Action Checklist</h4>
              <p className="text-gray-600">
                AI generates step-by-step actionable checklists for any niche.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  📊
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">✨ AI</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Business Scorecard</h4>
              <p className="text-gray-600">
                AI creates scorecards using Daniel Priestley's proven methodology.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  📖
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">✨ AI</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">PDF Guide/Ebook</h4>
              <p className="text-gray-600">
                AI generates complete guide outlines with 5-7 sections of content.
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-8 shadow-lg text-white">
              <div className="text-3xl mb-4">🎯</div>
              <h4 className="text-xl font-bold mb-3">All Niches Covered</h4>
              <p className="text-blue-50">
                SaaS • Coaching • Ecommerce • Real Estate • Fitness • Finance • Agencies & More
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Built on Proven Frameworks
            </h3>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our AI is trained on battle-tested methodologies from industry leaders
            </p>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-teal-600 mb-4">Alex Hormozi</h4>
                <p className="text-gray-600">
                  Value Equation • $100M Offers Framework • Lead Magnet Best Practices
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-blue-600 mb-4">Daniel Priestley</h4>
                <p className="text-gray-600">
                  Key Person of Influence • Scorecard Methodology • 7 Stages of Business Growth
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">What is BuildLead?</h4>
              <p className="text-gray-600">BuildLead is an AI-powered lead magnet creator that uses proven frameworks from Alex Hormozi and Daniel Priestley to generate professional content in seconds.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">How does the AI work?</h4>
              <p className="text-gray-600">Enter your business details and click "Generate with AI." The AI creates complete content using Hormozi and Priestley frameworks. You can then edit and customize before downloading your PDF.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">How much does BuildLead cost?</h4>
              <p className="text-gray-600">BuildLead costs $37 one-time for unlimited AI-powered lead magnets. You can try 1 lead magnet completely free before purchasing.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">What types of lead magnets can I create?</h4>
              <p className="text-gray-600">You can create 5 types with AI: Value Calculators, Interactive Quizzes, Action Checklists, Business Scorecards, and PDF Guides/Ebooks.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Do I need design or technical skills?</h4>
              <p className="text-gray-600">No! The AI does the heavy lifting. Simply fill in basic info, click generate, customize if needed, and download your professional PDF.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Is this a subscription or one-time payment?</h4>
              <p className="text-gray-600">One-time payment only. Pay $37 once and get lifetime access to all AI-powered builders with no recurring fees.</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Earn 30% Promoting BuildLead
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join our affiliate program and earn $11.10 for every sale you refer
            </p>
            <div className="bg-white rounded-xl p-8 mb-8 text-left max-w-2xl mx-auto">
              <h4 className="font-bold text-gray-900 mb-4">Perfect for:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Marketing influencers and content creators</li>
                <li>✓ Business coaches and consultants</li>
                <li>✓ SaaS reviewers and tech YouTubers</li>
                <li>✓ Podcast hosts and newsletter writers</li>
              </ul>
            </div>
              <a
              href="https://whop.com/buildlead-pro-unlimited-lead/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Become an Affiliate
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Instant approval • Real-time tracking • Monthly payouts via Whop
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-4xl font-bold mb-4">Ready to Build Your First AI-Powered Lead Magnet?</h3>
            <p className="text-xl mb-8 text-blue-100">
              {usesRemaining > 0 && !isPaid ? 'Try AI generation free. No credit card required.' : 'Start creating with AI now.'}
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="bg-white text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              {usesRemaining > 0 && !isPaid ? 'Start Free Trial →' : 'Start Building →'}
            </button>
          </div>
        </section>

        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  BuildLead
                </h4>
                <p className="text-gray-400 text-sm">
                  AI-powered lead magnet builder using proven frameworks from Alex Hormozi and Daniel Priestley.
                </p>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Product</h5>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><button onClick={() => navigate('/builder')} className="hover:text-white">Try Free</button></li>
                  <li><a href="https://whop.com/checkout/plan_3K6z9JF9ht5oU?d2c=true" className="hover:text-white">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Earn Money</h5>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="https://whop.com/buildlead-pro/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Affiliate Program (30%)</a></li>
                  <li className="text-xs text-gray-500">Earn $11.10 per sale</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400 text-sm">© 2025 BuildLead. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;