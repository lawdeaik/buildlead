import React, { useState } from 'react';
import jsPDF from 'jspdf';

const PDFGuide = ({ decrementUses, setStep }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    guideTitle: '',
    subtitle: '',
    authorName: '',
    introduction: '',
    sections: [
      { title: '', content: '' }
    ],
    callToAction: '',
    contactInfo: ''
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 🔑 PUT YOUR GEMINI API KEY HERE
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const addSection = () => {
    if (formData.sections.length < 10) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, { title: '', content: '' }]
      }));
    }
  };

  const removeSection = (index) => {
    if (formData.sections.length > 1) {
      const newSections = formData.sections.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, sections: newSections }));
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.businessName || !formData.niche || !formData.guideTitle) {
      alert('Please fill in Business Name, Niche, and Guide Title first');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const prompt = `You are an expert in Alex Hormozi and Daniel Priestley's frameworks.

Create a comprehensive PDF guide outline for:
Business: ${formData.businessName}
Niche: ${formData.niche}
Topic: ${formData.guideTitle}

Requirements:
- Create 5-7 main sections
- Use Hormozi's value-first and Priestley's authority-building frameworks
- Each section should have a clear title and 2-3 paragraphs of content
- Include an introduction and call-to-action
- Make it specific to ${formData.niche} and valuable for the target audience

Return ONLY a valid JSON object with this EXACT structure:
{
  "title": "${formData.guideTitle}",
  "subtitle": "Compelling subtitle here",
  "introduction": "2-3 paragraphs introducing the guide",
  "sections": [
    {
      "title": "Section Title",
      "content": "2-3 paragraphs of valuable content for this section"
    }
  ],
  "callToAction": "Strong CTA paragraph encouraging next steps"
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
            maxOutputTokens: 3072,
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
          const aiGuide = JSON.parse(jsonMatch[0]);
          
          setFormData(prev => ({
            ...prev,
            subtitle: aiGuide.subtitle || prev.subtitle,
            introduction: aiGuide.introduction || prev.introduction,
            sections: aiGuide.sections || prev.sections,
            callToAction: aiGuide.callToAction || prev.callToAction
          }));

          alert('✨ AI generated your guide! You can edit the content or generate PDF.');
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
    if (!formData.businessName || !formData.niche || !formData.guideTitle) {
      alert('Please fill in all required fields');
      return;
    }

    const hasEmptySections = formData.sections.some(section => 
      !section.title || !section.content
    );

    if (hasEmptySections) {
      alert('Please fill in all section titles and content');
      return;
    }

    decrementUses();
    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Cover Page
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, 210, 100, 'F');
    
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    const titleLines = doc.splitTextToSize(formData.guideTitle, 170);
    let titleY = 40;
    titleLines.forEach(line => {
      doc.text(line, 105, titleY, { align: 'center' });
      titleY += 12;
    });
    
    if (formData.subtitle) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'normal');
      const subtitleLines = doc.splitTextToSize(formData.subtitle, 170);
      subtitleLines.forEach(line => {
        doc.text(line, 105, titleY, { align: 'center' });
        titleY += 8;
      });
    }

    doc.setFontSize(14);
    doc.text(formData.businessName, 105, 120, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    if (formData.authorName) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`By ${formData.authorName}`, 105, 135, { align: 'center' });
    }

    // Table of Contents
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166);
    doc.setFont(undefined, 'bold');
    doc.text('Table of Contents', 20, 30);
    
    let tocY = 50;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    
    if (formData.introduction) {
      doc.text('Introduction', 25, tocY);
      tocY += 8;
    }
    
    formData.sections.forEach((section, index) => {
      doc.text(`${index + 1}. ${section.title}`, 25, tocY);
      tocY += 8;
    });
    
    if (formData.callToAction) {
      doc.text('Next Steps', 25, tocY);
    }

    // Introduction
    if (formData.introduction) {
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(20, 184, 166);
      doc.setFont(undefined, 'bold');
      doc.text('Introduction', 20, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, 'normal');
      const introLines = doc.splitTextToSize(formData.introduction, 170);
      doc.text(introLines, 20, 45);
    }

    // Sections
    formData.sections.forEach((section, index) => {
      doc.addPage();
      
      // Section Number & Title
      doc.setFontSize(18);
      doc.setTextColor(20, 184, 166);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${section.title}`, 20, 30);
      
      // Section Content
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, 'normal');
      const contentLines = doc.splitTextToSize(section.content, 170);
      
      let contentY = 45;
      contentLines.forEach(line => {
        if (contentY > 270) {
          doc.addPage();
          contentY = 20;
        }
        doc.text(line, 20, contentY);
        contentY += 5;
      });
    });

    // Call to Action
    if (formData.callToAction) {
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(20, 184, 166);
      doc.setFont(undefined, 'bold');
      doc.text('Next Steps', 20, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, 'normal');
      const ctaLines = doc.splitTextToSize(formData.callToAction, 170);
      doc.text(ctaLines, 20, 45);
    }

    // Contact Info
    if (formData.contactInfo) {
      let contactY = formData.callToAction ? 100 : 30;
      if (!formData.callToAction) {
        doc.addPage();
      }
      
      doc.setFontSize(12);
      doc.setTextColor(20, 184, 166);
      doc.setFont(undefined, 'bold');
      doc.text('Get in Touch', 20, contactY);
      
      contactY += 10;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, 'normal');
      const contactLines = doc.splitTextToSize(formData.contactInfo, 170);
      doc.text(contactLines, 20, contactY);
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`${formData.businessName} | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('Generated by BuildLead', 105, 290, { align: 'center' });
    }

    doc.save(`${formData.guideTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    alert('PDF Guide Generated! Check your downloads folder.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">PDF Guide/Ebook Builder</h2>
        <p className="text-gray-600 mb-8">Create professional downloadable guides with proven frameworks</p>

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
              placeholder="e.g., Expert Consulting Group"
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

          {/* Guide Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Guide Title *
            </label>
            <input
              type="text"
              name="guideTitle"
              value={formData.guideTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., The Ultimate Guide to Scaling Your Business"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Proven strategies from 7-figure entrepreneurs"
            />
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Author Name
            </label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., John Smith"
            />
          </div>

          {/* Introduction */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Introduction
            </label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Write an engaging introduction that hooks your reader..."
            />
          </div>

          {/* Sections */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Guide Sections</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingAI ? '✨ Generating...' : '✨ Generate with AI'}
                </button>
                <button
                  onClick={addSection}
                  disabled={formData.sections.length >= 10}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  + Add Section
                </button>
              </div>
            </div>

            {formData.sections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Section {index + 1}</h4>
                  {formData.sections.length > 1 && (
                    <button
                      onClick={() => removeSection(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Section Title *
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Understanding Your Target Market"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Section Content *
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Write the main content for this section. Include valuable insights, actionable tips, and examples..."
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Call to Action / Next Steps
            </label>
            <textarea
              name="callToAction"
              value={formData.callToAction}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Ready to take your business to the next level? Book a free consultation with our team..."
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Information
            </label>
            <textarea
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Email: hello@yourbusiness.com&#10;Website: www.yourbusiness.com&#10;Phone: (555) 123-4567"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Generate PDF Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFGuide;