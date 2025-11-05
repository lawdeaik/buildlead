import React, { useState } from 'react';
import jsPDF from 'jspdf';

const Checklist = ({ decrementUses, setStep }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    checklistTitle: '',
    checklistDescription: '',
    targetAudience: '',
    items: [
      { item: '', description: '' }
    ]
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 🔑 PUT YOUR GEMINI API KEY HERE
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    if (formData.items.length < 20) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { item: '', description: '' }]
      }));
    }
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.businessName || !formData.niche || !formData.checklistTitle) {
      alert('Please fill in Business Name, Niche, and Checklist Title first');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const prompt = `You are an expert in Alex Hormozi's actionable step-by-step frameworks.

Create a 10-item action checklist for:
Business: ${formData.businessName}
Niche: ${formData.niche}
Topic: ${formData.checklistTitle}
Target Audience: ${formData.targetAudience || 'General audience'}

Requirements:
- Use Hormozi's step-by-step action frameworks
- Each item should be specific and actionable
- Include brief descriptions (1-2 sentences) explaining why each step matters
- Order items logically from first to last step
- Make it practical and immediately implementable

Return ONLY a valid JSON array with this EXACT structure:
[
  {
    "item": "Action item text",
    "description": "Brief explanation of why this matters (1-2 sentences)"
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
          const aiItems = JSON.parse(jsonMatch[0]);
          
          setFormData(prev => ({
            ...prev,
            items: aiItems
          }));

          alert('✨ AI generated your checklist! You can edit the items or generate PDF.');
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
    if (!formData.businessName || !formData.niche || !formData.checklistTitle) {
      alert('Please fill in all required fields');
      return;
    }

    const hasEmptyItems = formData.items.some(item => !item.item);
    if (hasEmptyItems) {
      alert('Please fill in all checklist items');
      return;
    }

    decrementUses();
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title Page
    doc.setFontSize(24);
    doc.setTextColor(20, 184, 166);
    doc.text(formData.checklistTitle, 105, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(formData.businessName, 105, 55, { align: 'center' });
    
    if (formData.targetAudience) {
      doc.setFontSize(11);
      doc.text(`For: ${formData.targetAudience}`, 105, 65, { align: 'center' });
    }
    
    if (formData.checklistDescription) {
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(formData.checklistDescription, 170);
      doc.text(descLines, 105, 80, { align: 'center' });
    }

    let yPos = 110;

    // Checklist Items
    formData.items.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      // Checkbox
      doc.setLineWidth(0.5);
      doc.rect(20, yPos - 4, 5, 5);

      // Item
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      const itemText = doc.splitTextToSize(`${index + 1}. ${item.item}`, 160);
      doc.text(itemText, 30, yPos);
      yPos += itemText.length * 6;

      // Description
      if (item.description) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.setFont(undefined, 'normal');
        const descText = doc.splitTextToSize(item.description, 160);
        doc.text(descText, 30, yPos + 2);
        yPos += descText.length * 5 + 8;
      } else {
        yPos += 10;
      }
    });

    // Call to Action
    if (yPos > 230) {
      doc.addPage();
      yPos = 30;
    } else {
      yPos += 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(20, 184, 166);
    doc.setFont(undefined, 'bold');
    doc.text('Need Help Implementing This Checklist?', 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text('Contact us to learn how we can help you achieve these results faster.', 105, yPos, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by BuildLead', 105, 280, { align: 'center' });

    doc.save(`${formData.businessName.replace(/\s+/g, '-').toLowerCase()}-checklist.pdf`);
    
    alert('Checklist PDF Generated! Check your downloads folder.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Action Checklist Builder</h2>
        <p className="text-gray-600 mb-8">Create actionable checklists that provide immediate value</p>

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
              placeholder="e.g., Success Academy"
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

          {/* Checklist Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Checklist Title *
            </label>
            <input
              type="text"
              name="checklistTitle"
              value={formData.checklistTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., 10-Step Product Launch Checklist"
              required
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., First-time entrepreneurs launching digital products"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Checklist Description
            </label>
            <textarea
              name="checklistDescription"
              value={formData.checklistDescription}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Brief description of what this checklist helps achieve..."
            />
          </div>

          {/* Checklist Items */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Checklist Items</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingAI ? '✨ Generating...' : '✨ Generate with AI'}
                </button>
                <button
                  onClick={addItem}
                  disabled={formData.items.length >= 20}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Item {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Action Item *
                    </label>
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Set up your landing page"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Brief explanation or tips for this step..."
                    />
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
            Generate Checklist PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checklist;