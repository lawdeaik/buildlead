import React, { useState } from 'react';
import jsPDF from 'jspdf';

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
          { metric: '', maxScore: 10 }
        ]
      }
    ]
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 🔑 PUT YOUR GEMINI API KEY HERE
  const GEMINI_API_KEY = 'AIzaSyDQnfqZ6_1Fmlx6bnFiXrNtjqd3i-QzDPA';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (catIndex, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex][field] = value;
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const handleMetricChange = (catIndex, metIndex, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[catIndex].metrics[metIndex][field] = value;
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const addCategory = () => {
    if (formData.categories.length < 7) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, { 
          name: '', 
          description: '',
          metrics: [{ metric: '', maxScore: 10 }]
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
    if (newCategories[catIndex].metrics.length < 5) {
      newCategories[catIndex].metrics.push({ metric: '', maxScore: 10 });
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

Create a business scorecard with 5-7 categories for:
Business: ${formData.businessName}
Niche: ${formData.niche}
Focus: ${formData.scorecardTitle}

Requirements:
- Use Priestley's KPI and scorecard frameworks
- Each category should have 3-5 specific metrics
- Metrics should be measurable (scored 0-10)
- Include category descriptions
- Make it specific to ${formData.niche}

Return ONLY a valid JSON array with this EXACT structure:
[
  {
    "name": "Category Name",
    "description": "What this category measures",
    "metrics": [
      {"metric": "Specific measurable metric", "maxScore": 10}
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

          alert('✨ AI generated your scorecard! You can edit categories or generate PDF.');
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
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title Page
    doc.setFontSize(26);
    doc.setTextColor(20, 184, 166);
    doc.text(formData.scorecardTitle, 105, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(formData.businessName, 105, 55, { align: 'center' });
    
    if (formData.scorecardDescription) {
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(formData.scorecardDescription, 170);
      doc.text(descLines, 105, 70, { align: 'center' });
    }

    // Priestley Framework Note
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Based on Daniel Priestley\'s Key Person of Influence Scorecard Methodology', 105, 90, { align: 'center' });

    // Instructions
    doc.setFontSize(10);
    doc.text('Instructions: Rate yourself 0-10 for each metric. Be honest for accurate results.', 20, 110);

    let yPos = 130;
    let totalMaxScore = 0;

    // Categories and Metrics
    formData.categories.forEach((cat, catIndex) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 30;
      }

      // Category Name
      doc.setFontSize(14);
      doc.setTextColor(20, 184, 166);
      doc.setFont(undefined, 'bold');
      doc.text(`${catIndex + 1}. ${cat.name}`, 20, yPos);
      yPos += 8;

      // Category Description
      if (cat.description) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'normal');
        const catDescLines = doc.splitTextToSize(cat.description, 170);
        doc.text(catDescLines, 20, yPos);
        yPos += catDescLines.length * 5 + 5;
      }

      // Metrics
      cat.metrics.forEach((metric, metIndex) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 30;
        }

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const metricText = doc.splitTextToSize(`   • ${metric.metric}`, 140);
        doc.text(metricText, 23, yPos);
        
        // Score box
        doc.setLineWidth(0.3);
        doc.rect(165, yPos - 4, 25, 6);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`/10`, 192, yPos);
        
        yPos += metricText.length * 5 + 3;
        totalMaxScore += parseInt(metric.maxScore);
      });

      yPos += 10;
    });

    // Scoring Guide - New Page
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text('Your Score Interpretation', 105, 30, { align: 'center' });

    yPos = 50;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Total Possible Score:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${totalMaxScore}`, 70, yPos);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const excellent = Math.ceil(totalMaxScore * 0.8);
    const good = Math.ceil(totalMaxScore * 0.6);
    const developing = Math.ceil(totalMaxScore * 0.4);

    // Scoring Bands
    doc.setFont(undefined, 'bold');
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`${excellent}-${totalMaxScore}: Excellent`, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('You\'re performing at a high level. Focus on optimization and scaling.', 25, yPos + 6);
    
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`${good}-${excellent - 1}: Good`, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Solid foundation. Identify weak areas for targeted improvement.', 25, yPos + 6);
    
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(251, 146, 60); // Orange
    doc.text(`${developing}-${good - 1}: Developing`, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Room for growth. Focus on foundational improvements first.', 25, yPos + 6);
    
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`Below ${developing}: Needs Attention`, 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Significant opportunity for improvement. Let\'s work together.', 25, yPos + 6);

    // Next Steps
    yPos += 30;
    doc.setFontSize(14);
    doc.setTextColor(20, 184, 166);
    doc.setFont(undefined, 'bold');
    doc.text('Recommended Next Steps:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text('1. Calculate your total score across all categories', 25, yPos);
    yPos += 7;
    doc.text('2. Identify your lowest-scoring categories', 25, yPos);
    yPos += 7;
    doc.text('3. Focus on improving 1-2 categories at a time', 25, yPos);
    yPos += 7;
    doc.text('4. Re-assess quarterly to track progress', 25, yPos);
    yPos += 7;
    doc.text('5. Consider expert guidance for accelerated results', 25, yPos);

    // CTA
    yPos += 25;
    doc.setFontSize(12);
    doc.setTextColor(20, 184, 166);
    doc.setFont(undefined, 'bold');
    doc.text('Want a Personalized Action Plan?', 105, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text('Contact us for a detailed scorecard review and customized improvement strategy.', 105, yPos, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by BuildLead - Based on Daniel Priestley\'s Scorecard Methodology', 105, 280, { align: 'center' });

    doc.save(`${formData.businessName.replace(/\s+/g, '-').toLowerCase()}-scorecard.pdf`);
    
    alert('Scorecard PDF Generated! Check your downloads folder.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Scorecard Builder</h2>
        <p className="text-gray-600 mb-8">Based on Daniel Priestley's Key Person of Influence methodology</p>

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
                      <h5 className="font-semibold text-gray-900 text-sm">Metrics</h5>
                      <button
                        onClick={() => addMetric(catIndex)}
                        disabled={cat.metrics.length >= 5}
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
                          onChange={(e) => handleMetricChange(catIndex, metIndex, 'metric', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          placeholder="e.g., Social media presence"
                          required
                        />
                        <span className="text-sm text-gray-600">/10</span>
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
            Generate Scorecard PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;