import React, { useState } from 'react';

const ValueCalculator = ({ decrementUses, setStep }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    calculatorTitle: '',
    calculatorDescription: '',
    dreamOutcome: {
      label: 'Dream Outcome',
      description: 'What result does your prospect want?',
      placeholder: 'e.g., Lose 20 pounds'
    },
    perceivedLikelihood: {
      label: 'Perceived Likelihood of Success',
      description: 'How confident are they in achieving it?',
      placeholder: 'e.g., Success rate %'
    },
    timeDelay: {
      label: 'Time Delay',
      description: 'How long until they see results?',
      placeholder: 'e.g., Weeks to goal'
    },
    effortSacrifice: {
      label: 'Effort & Sacrifice',
      description: 'How much work is required?',
      placeholder: 'e.g., Hours per week'
    },
    resultMessages: {
      high: { title: '', message: '', cta: '' },
      medium: { title: '', message: '', cta: '' },
      low: { title: '', message: '', cta: '' }
    }
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (field, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleResultMessageChange = (level, field, value) => {
    setFormData(prev => ({
      ...prev,
      resultMessages: {
        ...prev.resultMessages,
        [level]: {
          ...prev.resultMessages[level],
          [field]: value
        }
      }
    }));
  };

  const handleGenerateWithAI = async () => {
    if (!formData.businessName || !formData.niche || !formData.calculatorTitle) {
      alert('Please fill in Business Name, Niche, and Calculator Title first');
      return;
    }

    if (!GEMINI_API_KEY) {
      alert('API key not configured. Please contact support.');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const prompt = `You are an expert in Alex Hormozi's Value Equation framework from $100M Offers.

Create a Value Calculator for:
Business: ${formData.businessName}
Niche: ${formData.niche}
Calculator: ${formData.calculatorTitle}

The Value Equation is: Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)

Create customized labels and descriptions for each variable specific to ${formData.niche}.

Also create result messages for high/medium/low value scores.

Return ONLY a valid JSON object with this EXACT structure:
{
  "dreamOutcome": {
    "label": "Custom label for dream outcome",
    "description": "What this measures in their context",
    "placeholder": "Example input"
  },
  "perceivedLikelihood": {
    "label": "Custom label for likelihood",
    "description": "What this measures",
    "placeholder": "Example input"
  },
  "timeDelay": {
    "label": "Custom label for time",
    "description": "What this measures",
    "placeholder": "Example input"
  },
  "effortSacrifice": {
    "label": "Custom label for effort",
    "description": "What this measures",
    "placeholder": "Example input"
  },
  "resultMessages": {
    "high": {
      "title": "High Value Result",
      "message": "Message for high value scores...",
      "cta": "Call to action"
    },
    "medium": {
      "title": "Medium Value Result",
      "message": "Message for medium scores...",
      "cta": "Call to action"
    },
    "low": {
      "title": "Low Value Result",
      "message": "Message for low scores...",
      "cta": "Call to action"
    }
  }
}

No additional text or formatting.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          
          setFormData(prev => ({
            ...prev,
            dreamOutcome: aiData.dreamOutcome || prev.dreamOutcome,
            perceivedLikelihood: aiData.perceivedLikelihood || prev.perceivedLikelihood,
            timeDelay: aiData.timeDelay || prev.timeDelay,
            effortSacrifice: aiData.effortSacrifice || prev.effortSacrifice,
            resultMessages: aiData.resultMessages || prev.resultMessages
          }));

          alert('✨ AI generated your calculator! You can edit fields or generate HTML.');
        } else {
          throw new Error('Could not parse AI response');
        }
      } else {
        throw new Error('Invalid AI response structure');
      }
      
    } catch (error) {
      console.error('AI Error:', error);
      alert('AI generation failed: ' + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerate = () => {
    if (!formData.businessName || !formData.niche || !formData.calculatorTitle) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.dreamOutcome.label || !formData.perceivedLikelihood.label || 
        !formData.timeDelay.label || !formData.effortSacrifice.label) {
      alert('Please fill in all calculator fields');
      return;
    }

    if (!formData.resultMessages.high.title || !formData.resultMessages.medium.title || 
        !formData.resultMessages.low.title) {
      alert('Please fill in all result messages');
      return;
    }

    decrementUses();
    generateHTML();
  };

  const generateHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.calculatorTitle} - ${formData.businessName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 700px;
            width: 100%;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f5576c;
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 16px;
        }
        .equation-display {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
            font-size: 18px;
            font-weight: 600;
        }
        .input-section {
            margin-bottom: 25px;
        }
        .input-group {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 15px;
        }
        .input-label {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .input-description {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
        }
        .input-field {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .slider {
            flex: 1;
            height: 8px;
            border-radius: 4px;
            background: #e0e0e0;
            outline: none;
            -webkit-appearance: none;
        }
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #f5576c;
            cursor: pointer;
        }
        .slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #f5576c;
            cursor: pointer;
            border: none;
        }
        .slider-value {
            font-size: 20px;
            font-weight: 700;
            color: #f5576c;
            min-width: 40px;
            text-align: right;
        }
        .divider {
            text-align: center;
            margin: 20px 0;
            font-size: 24px;
            color: #999;
        }
        .calculate-btn {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: transform 0.2s ease;
        }
        .calculate-btn:hover {
            transform: translateY(-2px);
        }
        .result-container {
            display: none;
            margin-top: 30px;
            padding: 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 16px;
            color: white;
            text-align: center;
        }
        .result-container.show {
            display: block;
            animation: slideIn 0.5s ease;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .value-score {
            font-size: 72px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .value-label {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .result-message {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
        }
        .result-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .result-text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .cta-button {
            background: white;
            color: #f5576c;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            display: inline-block;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formData.calculatorTitle}</h1>
            <p>${formData.businessName}${formData.calculatorDescription ? ' • ' + formData.calculatorDescription : ''}</p>
        </div>

        <div class="equation-display">
            Value = (Dream Outcome × Likelihood) ÷ (Time + Effort)
        </div>

        <div class="input-section">
            <!-- Dream Outcome -->
            <div class="input-group">
                <div class="input-label">${formData.dreamOutcome.label}</div>
                <div class="input-description">${formData.dreamOutcome.description}</div>
                <div class="input-field">
                    <input type="range" min="1" max="10" value="5" class="slider" id="dreamOutcome">
                    <span class="slider-value" id="dreamOutcomeValue">5</span>
                </div>
            </div>

            <!-- Perceived Likelihood -->
            <div class="input-group">
                <div class="input-label">${formData.perceivedLikelihood.label}</div>
                <div class="input-description">${formData.perceivedLikelihood.description}</div>
                <div class="input-field">
                    <input type="range" min="1" max="10" value="5" class="slider" id="perceivedLikelihood">
                    <span class="slider-value" id="perceivedLikelihoodValue">5</span>
                </div>
            </div>

            <div class="divider">÷</div>

            <!-- Time Delay -->
            <div class="input-group">
                <div class="input-label">${formData.timeDelay.label}</div>
                <div class="input-description">${formData.timeDelay.description}</div>
                <div class="input-field">
                    <input type="range" min="1" max="10" value="5" class="slider" id="timeDelay">
                    <span class="slider-value" id="timeDelayValue">5</span>
                </div>
            </div>

            <!-- Effort & Sacrifice -->
            <div class="input-group">
                <div class="input-label">${formData.effortSacrifice.label}</div>
                <div class="input-description">${formData.effortSacrifice.description}</div>
                <div class="input-field">
                    <input type="range" min="1" max="10" value="5" class="slider" id="effortSacrifice">
                    <span class="slider-value" id="effortSacrificeValue">5</span>
                </div>
            </div>
        </div>

        <button class="calculate-btn" id="calculateBtn">Calculate My Value Score</button>

        <div class="result-container" id="resultContainer">
            <div class="value-score" id="valueScore">0</div>
            <div class="value-label">Your Value Score</div>
            <div class="result-message">
                <div class="result-title" id="resultTitle"></div>
                <div class="result-text" id="resultText"></div>
                <a href="#" class="cta-button" id="ctaButton"></a>
            </div>
        </div>

        <div class="footer">
            Powered by ${formData.businessName} • Based on Alex Hormozi's Value Equation
        </div>
    </div>

    <script>
        const resultMessages = ${JSON.stringify(formData.resultMessages)};

        // Update slider values in real-time
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', function() {
                document.getElementById(this.id + 'Value').textContent = this.value;
            });
        });

        // Calculate value score
        document.getElementById('calculateBtn').addEventListener('click', function() {
            const dreamOutcome = parseFloat(document.getElementById('dreamOutcome').value);
            const perceivedLikelihood = parseFloat(document.getElementById('perceivedLikelihood').value);
            const timeDelay = parseFloat(document.getElementById('timeDelay').value);
            const effortSacrifice = parseFloat(document.getElementById('effortSacrifice').value);

            // Hormozi's Value Equation
            const valueScore = ((dreamOutcome * perceivedLikelihood) / (timeDelay + effortSacrifice)).toFixed(1);

            // Determine result level
            let resultLevel;
            if (valueScore >= 5) {
                resultLevel = 'high';
            } else if (valueScore >= 2.5) {
                resultLevel = 'medium';
            } else {
                resultLevel = 'low';
            }

            const result = resultMessages[resultLevel];

            document.getElementById('valueScore').textContent = valueScore;
            document.getElementById('resultTitle').textContent = result.title;
            document.getElementById('resultText').textContent = result.message;
            document.getElementById('ctaButton').textContent = result.cta;

            document.getElementById('resultContainer').classList.add('show');
            document.getElementById('resultContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.businessName.replace(/\s+/g, '-').toLowerCase()}-value-calculator.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Interactive Value Calculator HTML Generated! Upload this file to your website.');
    setStep('select');
  };

  const niches = [
    'SaaS/Software', 'Coaching/Consulting', 'Ecommerce', 'Real Estate',
    'Fitness/Health', 'Finance/Investing', 'Marketing Agency', 'Legal Services',
    'Education/Training', 'Healthcare', 'B2B Services', 'Restaurant/Food',
    'Beauty/Wellness', 'Construction', 'Automotive', 'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Value Calculator Builder</h2>
        <p className="text-gray-600 mb-8">Create ROI calculators using Hormozi's Value Equation</p>

        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Growth Accelerator"
              required
            />
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Niche/Industry *
            </label>
            <select
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="">Select your niche...</option>
              {niches.map(niche => (
                <option key={niche} value={niche}>{niche}</option>
              ))}
            </select>
          </div>

          {/* Calculator Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calculator Title *
            </label>
            <input
              type="text"
              name="calculatorTitle"
              value={formData.calculatorTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., What's Your Transformation Worth?"
              required
            />
          </div>

          {/* Calculator Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calculator Description
            </label>
            <textarea
              name="calculatorDescription"
              value={formData.calculatorDescription}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Brief description of what this calculator helps determine..."
            />
          </div>

          {/* AI Generate Button */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Calculator Variables</h3>
              <button
                onClick={handleGenerateWithAI}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGeneratingAI ? '✨ Generating...' : '✨ Generate with AI'}
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Hormozi's Value Equation:</strong> Value = (Dream Outcome × Perceived Likelihood) ÷ (Time Delay + Effort & Sacrifice)
              </p>
            </div>

            {/* Dream Outcome */}
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Dream Outcome (Numerator)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.dreamOutcome.label}
                  onChange={(e) => handleFieldChange('dreamOutcome', 'label', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Label (e.g., 'Desired Weight Loss')"
                  required
                />
                <input
                  type="text"
                  value={formData.dreamOutcome.description}
                  onChange={(e) => handleFieldChange('dreamOutcome', 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Description (e.g., 'Rate how important this goal is to you')"
                  required
                />
                <input
                  type="text"
                  value={formData.dreamOutcome.placeholder}
                  onChange={(e) => handleFieldChange('dreamOutcome', 'placeholder', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Example for user (e.g., 'Lose 20 pounds')"
                />
              </div>
            </div>

            {/* Perceived Likelihood */}
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Perceived Likelihood (Numerator)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.perceivedLikelihood.label}
                  onChange={(e) => handleFieldChange('perceivedLikelihood', 'label', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Label (e.g., 'Confidence Level')"
                  required
                />
                <input
                  type="text"
                  value={formData.perceivedLikelihood.description}
                  onChange={(e) => handleFieldChange('perceivedLikelihood', 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Description (e.g., 'How confident are you in achieving this?')"
                  required
                />
                <input
                  type="text"
                  value={formData.perceivedLikelihood.placeholder}
                  onChange={(e) => handleFieldChange('perceivedLikelihood', 'placeholder', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Example for user"
                />
              </div>
            </div>

            {/* Time Delay */}
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Time Delay (Denominator)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.timeDelay.label}
                  onChange={(e) => handleFieldChange('timeDelay', 'label', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Label (e.g., 'Time to Results')"
                  required
                />
                <input
                  type="text"
                  value={formData.timeDelay.description}
                  onChange={(e) => handleFieldChange('timeDelay', 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Description (e.g., 'How long until you see results?')"
                  required
                />
                <input
                  type="text"
                  value={formData.timeDelay.placeholder}
                  onChange={(e) => handleFieldChange('timeDelay', 'placeholder', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Example for user"
                />
              </div>
            </div>

            {/* Effort & Sacrifice */}
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Effort & Sacrifice (Denominator)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.effortSacrifice.label}
                  onChange={(e) => handleFieldChange('effortSacrifice', 'label', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Label (e.g., 'Required Commitment')"
                  required
                />
                <input
                  type="text"
                  value={formData.effortSacrifice.description}
                  onChange={(e) => handleFieldChange('effortSacrifice', 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Description (e.g., 'How much work is required?')"
                  required
                />
                <input
                  type="text"
                  value={formData.effortSacrifice.placeholder}
                  onChange={(e) => handleFieldChange('effortSacrifice', 'placeholder', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Example for user"
                />
              </div>
            </div>
          </div>

         {/* Result Messages */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Result Messages</h3>
            
            {/* High Score */}
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-green-800 mb-3">High Value (5.0+)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.resultMessages.high.title}
                  onChange={(e) => handleResultMessageChange('high', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Exceptional Value!"
                  required
                />
                <textarea
                  value={formData.resultMessages.high.message}
                  onChange={(e) => handleResultMessageChange('high', 'message', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Message for high value scores..."
                  required
                />
                <input
                  type="text"
                  value={formData.resultMessages.high.cta}
                  onChange={(e) => handleResultMessageChange('high', 'cta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Book Your Free Strategy Call"
                  required
                />
              </div>
            </div>

            {/* Medium Score */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-3">Medium Value (2.5-4.9)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.resultMessages.medium.title}
                  onChange={(e) => handleResultMessageChange('medium', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Good Potential"
                  required
                />
                <textarea
                  value={formData.resultMessages.medium.message}
                  onChange={(e) => handleResultMessageChange('medium', 'message', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Message for medium scores..."
                  required
                />
                <input
                  type="text"
                  value={formData.resultMessages.medium.cta}
                  onChange={(e) => handleResultMessageChange('medium', 'cta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Learn More About Our Program"
                  required
                />
              </div>
            </div>

            {/* Low Score */}
            <div className="bg-red-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-red-800 mb-3">Low Value (Below 2.5)</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.resultMessages.low.title}
                  onChange={(e) => handleResultMessageChange('low', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Let's Optimize"
                  required
                />
                <textarea
                  value={formData.resultMessages.low.message}
                  onChange={(e) => handleResultMessageChange('low', 'message', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Message for low scores..."
                  required
                />
                <input
                  type="text"
                  value={formData.resultMessages.low.cta}
                  onChange={(e) => handleResultMessageChange('low', 'cta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Download Our Free Guide"
                  required
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Generate Interactive Calculator HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueCalculator;