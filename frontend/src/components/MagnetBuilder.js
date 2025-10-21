import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailModal from './EmailModal';
import ValueCalculator from './builders/ValueCalculator';
import Quiz from './builders/Quiz';
import Checklist from './builders/Checklist';
import Scorecard from './builders/Scorecard';
import PDFGuide from './builders/PDFGuide';

const MagnetBuilder = ({ decrementUses, usesRemaining, isPaid, userEmail, saveEmail }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select');
  const [selectedType, setSelectedType] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Show email modal immediately if no email
  useEffect(() => {
    if (!userEmail && !isPaid) {
      setShowEmailModal(true);
    }
  }, [userEmail, isPaid]);

  const magnetTypes = [
    {
      id: 'value-calculator',
      name: 'Value Calculator',
      icon: '🧮',
      description: "Hormozi's Value Equation - Calculate ROI for prospects",
      component: ValueCalculator
    },
    {
      id: 'quiz',
      name: 'Interactive Quiz',
      icon: '✅',
      description: 'Engage and qualify leads with personalized assessments',
      component: Quiz
    },
    {
      id: 'checklist',
      name: 'Action Checklist',
      icon: '📋',
      description: 'Simple, actionable steps that provide immediate value',
      component: Checklist
    },
    {
      id: 'scorecard',
      name: 'Business Scorecard',
      icon: '📊',
      description: "Priestley's scorecard methodology for benchmarking",
      component: Scorecard
    },
    {
      id: 'pdf-guide',
      name: 'PDF Guide/Ebook',
      icon: '📖',
      description: 'Professional downloadable guides with proven frameworks',
      component: PDFGuide
    }
  ];

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep('input');
  };

  const handleBack = () => {
    if (step === 'input') {
      setStep('select');
      setSelectedType(null);
    } else {
      navigate('/');
    }
  };

  const handleEmailSubmit = (email) => {
    saveEmail(email);
    setShowEmailModal(false);
  };

  const SelectedComponent = selectedType?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              BuildLead
            </h1>
            {!isPaid && (
              <div className="text-sm text-gray-600">
                {usesRemaining} {usesRemaining === 1 ? 'use' : 'uses'} remaining
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center ${step === 'select' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'select' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Select Type</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'input' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'input' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Input Details</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'output' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'output' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-semibold">Download</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === 'select' && (
          <div>
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Choose Your Lead Magnet Type
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Select the type of lead magnet you want to create
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {magnetTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-left"
                >
                  <div className="text-5xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'input' && SelectedComponent && (
          <SelectedComponent 
            decrementUses={decrementUses}
            setStep={setStep}
          />
        )}
      </div>

      {/* Email Modal - Shows immediately when page loads if no email */}
      {showEmailModal && (
        <EmailModal
          onSubmit={handleEmailSubmit}
          onClose={() => {
            // Only allow close if they already have email OR are paid
            if (userEmail || isPaid) {
              setShowEmailModal(false);
            } else {
              alert('Please enter your email to continue with your free trial');
            }
          }}
        />
      )}
    </div>
  );
};

export default MagnetBuilder;