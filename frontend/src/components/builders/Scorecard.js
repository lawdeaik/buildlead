import React, { useState } from 'react';

const Scorecard = ({ decrementUses, setStep }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    scorecardTitle: '',
    scorecardDescription: '',
    categories: [
      { 
        name: '', 
        description: '',
        metrics: [
          { metric: '' }
        ]
      }
    ]
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 🔑 PUT YOUR GEMINI API KEY HERE
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (catIndex, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex][field] = value;
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const handleMetricChange = (catIndex, metIndex, value) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex].metrics[metIndex].metric = value;
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const addCategory = () => {
    if (formData.categories.length < 7) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, { 
          name: '', 
          description: '',
          metrics: [{ metric: '' }]
        }]
      }));
    }
  };

  const removeCategory = (index) => {
    if (formData.categories.length > 1) {
      const newCategories = formData.categories.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, categories: newCategories }));
    }
  };

  const addMetric = (catIndex) => {
    const newCategories = [...formData.categories];
    if (newCategories[catIndex].metrics.length < 10) {
      newCategories[catIndex].metrics.push({ metric: '' });
      setFormData(prev => ({ ...prev, categories: newCategories }));
    }
  };

  const removeMetric = (catIndex, metIndex) => {
    const newCategories = [...formData.categories];
    if (newCategories[catIndex].metrics.length > 1) {
      newCategories[catIndex].metrics = newCategories[catIndex].metrics.filter((_, i) => i !== metIndex);
      setFormData(prev => ({ ...prev, categories: newCategories }));
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.businessName || !formData.niche || !formData.scorecardTitle) {
      alert('Please fill in Business Name, Niche, and Scorecard Title first');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const prompt = `You are an expert in Daniel Priestley's Key Person of Influence scorecard methodology.

Create a business scorecard for:
Business: ${formData.businessName}
Niche: ${formData.niche}
Focus: ${formData.scorecardTitle}

Requirements:
- Create 5-7 categories based on Priestley's KPI framework
- Each category should have 3-5 specific metrics
- Metrics should be measurable (rated 0-10)
- Use categories like: Pitch, Publish, Product, Profile, Partnership
- Or use: Clarity, Credibility, Scalability, Visibility, Connectivity
- Make it specific to ${formData.niche}

Return ONLY a valid JSON array with this EXACT structure:
[
  {
    "name": "Category Name",
    "description": "What this category measures",
    "metrics": [
      {"metric": "Specific measurable metric"}
    ]
  }
]

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
        
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiCategories = JSON.parse(jsonMatch[0]);
          
          setFormData(prev => ({
            ...prev,
            categories: aiCategories
          }));

          alert('✨ AI generated your scorecard! You can edit categories or generate HTML.');
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
    if (!formData.businessName || !formData.niche || !formData.scorecardTitle) {
      alert('Please fill in all required fields');
      return;
    }

    const hasEmptyCategories = formData.categories.some(cat => 
      !cat.name || cat.metrics.some(m => !m.metric)
    );

    if (hasEmptyCategories) {
      alert('Please fill in all category names and metrics');
      return;
    }

    decrementUses();
    generateHTML();
  };

  const generateHTML = () => {
    const totalMetrics = formData.categories.reduce((sum, cat) => sum + cat.metrics.length, 0);
    const maxScore = totalMetrics * 10;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.scorecardTitle} - ${formData.businessName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #14b8a6;
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 16px;
        }
        .intro {
            background: #f0fdfa;
            border-left: 4px solid #14b8a6;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
        }
        .intro p {
            color: #0f766e;
            font-size: 14px;
            line-height: 1.6;
        }
        .category {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
        }
        .category-header {
            margin-bottom: 15px;
        }
        .category-name {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 5px;
        }
        .category-description {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 15px;
        }
        .category-score {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
        }
        .category-score-label {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
        }
        .category-score-bar {
            flex: 1;
            height: 24px;
            background: #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }
        .category-score-fill {
            height: 100%;
            background: linear-gradient(90deg, #14b8a6 0%, #0891b2 100%);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .category-score-text {
            font-size: 12px;
            font-weight: 600;
            color: white;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }
        .metric {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 8px;
        }
        .metric-label {
            flex: 1;
            font-size: 14px;
            color: #334155;
        }
        .metric-input {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .slider {
            width: 200px;
            height: 6px;
            border-radius: 3px;
            background: #e2e8f0;
            outline: none;
            -webkit-appearance: none;
        }
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #14b8a6;
            cursor: pointer;
        }
        .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #14b8a6;
            cursor: pointer;
            border: none;
        }
        .slider-value {
            font-size: 16px;
            font-weight: 600;
            color: #14b8a6;
            min-width: 30px;
            text-align: right;
        }
        .results {
            display: none;
            background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
            border-radius: 16px;
            padding: 40px;
            margin-top: 30px;
            text-align: center;
            color: white;
        }
        .results.show {
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
        .total-score {
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .total-score-label {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .score-interpretation {
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
        }
        .interpretation-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .interpretation-text {
            font-size: 16px;
            line-height: 1.6;
            opacity: 0.95;
        }
        .btn {
            background: white;
            color: #14b8a6;
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 30px;
            transition: transform 0.2s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formData.scorecardTitle}</h1>
            <p>${formData.businessName}${formData.scorecardDescription ? ' • ' + formData.scorecardDescription : ''}</p>
        </div>

        <div class="intro">
            <p><strong>Instructions:</strong> Rate yourself honestly on each metric from 0-10. Your scores will help identify your strengths and areas for improvement.</p>
        </div>

        <div id="categories">
            ${formData.categories.map((cat, catIndex) => `
            <div class="category" data-category="${catIndex}">
                <div class="category-header">
                    <div class="category-name">${cat.name}</div>
                    ${cat.description ? `<div class="category-description">${cat.description}</div>` : ''}
                </div>
                
                ${cat.metrics.map((metric, metIndex) => `
                <div class="metric">
                    <div class="metric-label">${metric.metric}</div>
                    <div class="metric-input">
                        <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            value="5" 
                            class="slider" 
                            data-category="${catIndex}"
                            data-metric="${metIndex}"
                        >
                        <span class="slider-value">5</span>
                    </div>
                </div>
                `).join('')}
                
                <div class="category-score">
                    <span class="category-score-label">Category Score:</span>
                    <div class="category-score-bar">
                        <div class="category-score-fill" style="width: 50%">
                            <span class="category-score-text">0/${cat.metrics.length * 10}</span>
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>

        <button class="btn" id="calculateBtn">Calculate My Score</button>

        <div class="results" id="results">
            <div class="total-score" id="totalScore">0</div>
            <div class="total-score-label">out of ${maxScore} points</div>
            <div class="score-interpretation">
                <div class="interpretation-title" id="interpretationTitle"></div>
                <div class="interpretation-text" id="interpretationText"></div>
            </div>
        </div>

        <div class="footer">
            Powered by ${formData.businessName} • Based on Daniel Priestley's KPI Methodology
        </div>
    </div>

    <script>
        const scorecardData = ${JSON.stringify(formData)};
        const scores = {};

        // Initialize scores
        scorecardData.categories.forEach((cat, catIndex) => {
            scores[catIndex] = {};
            cat.metrics.forEach((metric, metIndex) => {
                scores[catIndex][metIndex] = 5;
            });
        });

        // Handle slider changes
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', function() {
                const catIndex = parseInt(this.dataset.category);
                const metIndex = parseInt(this.dataset.metric);
                const value = parseInt(this.value);
                
                // Update displayed value
                this.nextElementSibling.textContent = value;
                
                // Update score
                scores[catIndex][metIndex] = value;
                
                // Update category score
                updateCategoryScore(catIndex);
            });
        });

        function updateCategoryScore(catIndex) {
            const category = scorecardData.categories[catIndex];
            const categoryScores = scores[catIndex];
            const totalScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);
            const maxScore = category.metrics.length * 10;
            const percentage = (totalScore / maxScore) * 100;
            
            const categoryElement = document.querySelector(\`.category[data-category="\${catIndex}"]\`);
            const scoreFill = categoryElement.querySelector('.category-score-fill');
            const scoreText = categoryElement.querySelector('.category-score-text');
            
            scoreFill.style.width = percentage + '%';
            scoreText.textContent = \`\${totalScore}/\${maxScore}\`;
        }

        // Calculate total score
        document.getElementById('calculateBtn').addEventListener('click', function() {
            let totalScore = 0;
            let maxPossible = ${maxScore};
            
            Object.values(scores).forEach(categoryScores => {
                totalScore += Object.values(categoryScores).reduce((sum, val) => sum + val, 0);
            });
            
            const percentage = (totalScore / maxPossible) * 100;
            
            // Determine interpretation
            let title, text;
            if (percentage >= 80) {
                title = "Excellent!";
                text = "You're performing at a high level. Focus on optimization and scaling your strengths.";
            } else if (percentage >= 60) {
                title = "Good Progress";
                text = "Solid foundation. Identify your weakest areas for targeted improvement.";
            } else if (percentage >= 40) {
                title = "Developing";
                text = "Room for growth. Focus on foundational improvements in your lowest-scoring categories.";
            } else {
                title = "Needs Attention";
                text = "Significant opportunity for improvement. Let's work together to elevate your performance.";
            }
            
            document.getElementById('totalScore').textContent = totalScore;
            document.getElementById('interpretationTitle').textContent = title;
            document.getElementById('interpretationText').textContent = text;
            document.getElementById('results').classList.add('show');
            
            // Scroll to results
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // Initialize category scores
        scorecardData.categories.forEach((cat, catIndex) => {
            updateCategoryScore(catIndex);
        });
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.businessName.replace(/\s+/g, '-').toLowerCase()}-scorecard.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Interactive Scorecard HTML Generated! Upload this file to your website.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Scorecard Builder</h2>
        <p className="text-gray-600 mb-8">Create business assessment scorecards based on Daniel Priestley's KPI methodology</p>

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
              placeholder="e.g., Growth Strategies Inc"
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

          {/* Scorecard Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scorecard Title *
            </label>
            <input
              type="text"
              name="scorecardTitle"
              value={formData.scorecardTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Business Readiness Scorecard"
              required
            />
          </div>

          {/* Scorecard Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scorecard Description
            </label>
            <textarea
              name="scorecardDescription"
              value={formData.scorecardDescription}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Brief description of what this scorecard measures..."
            />
          </div>

          {/* Categories */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Scorecard Categories</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingAI ? '✨ Generating...' : '✨ Generate with AI'}
                </button>
                <button
                  onClick={addCategory}
                  disabled={formData.categories.length >= 7}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  + Add Category
                </button>
              </div>
            </div>

            {formData.categories.map((cat, catIndex) => (
              <div key={catIndex} className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Category {catIndex + 1}</h4>
                  {formData.categories.length > 1 && (
                    <button
                      onClick={() => removeCategory(catIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove Category
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleCategoryChange(catIndex, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Marketing & Visibility"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Description
                    </label>
                    <textarea
                      value={cat.description}
                      onChange={(e) => handleCategoryChange(catIndex, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Brief description of this category..."
                    />
                  </div>

                  {/* Metrics */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-900 text-sm">Metrics (Rate 0-10)</h5>
                      <button
                        onClick={() => addMetric(catIndex)}
                        disabled={cat.metrics.length >= 10}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        + Add Metric
                      </button>
                    </div>

                    {cat.metrics.map((metric, metIndex) => (
                      <div key={metIndex} className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={metric.metric}
                          onChange={(e) => handleMetricChange(catIndex, metIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          placeholder="e.g., Quality of social media presence"
                          required
                        />
                        {cat.metrics.length > 1 && (
                          <button
                            onClick={() => removeMetric(catIndex, metIndex)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Generate Interactive Scorecard HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;