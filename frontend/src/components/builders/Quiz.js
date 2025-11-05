import React, { useState } from 'react';

const Quiz = ({ decrementUses, setStep }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    quizTitle: '',
    quizDescription: '',
    questions: [
      { 
        question: '', 
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ],
    resultMessages: {
      high: { title: '', message: '', cta: '' },
      medium: { title: '', message: '', cta: '' },
      low: { title: '', message: '', cta: '' }
    }
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 🔑 PUT YOUR GEMINI API KEY HERE
  const GEMINI_API_KEY = 'AIzaSyDQnfqZ6_1Fmlx6bnFiXrNtjqd3i-QzDPA';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].correctAnswer = parseInt(value);
    setFormData(prev => ({ ...prev, questions: newQuestions }));
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

  const addQuestion = () => {
    if (formData.questions.length < 20) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { 
          question: '', 
          options: ['', '', '', ''],
          correctAnswer: 0
        }]
      }));
    }
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.businessName || !formData.niche || !formData.quizTitle) {
      alert('Please fill in Business Name, Niche, and Quiz Title first');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const prompt = `You are an expert in Alex Hormozi's lead qualification frameworks.

Create a qualifying quiz for:
Business: ${formData.businessName}
Niche: ${formData.niche}
Topic: ${formData.quizTitle}

Requirements:
- Create 10 qualification questions that identify ideal customers
- Each question has 4 multiple choice options (A, B, C, D)
- Use Hormozi's qualification methodology (budget, urgency, fit)
- Questions should reveal: readiness to buy, budget level, commitment level
- Include result messages for high/medium/low scorers

Return ONLY a valid JSON object with this EXACT structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ],
  "resultMessages": {
    "high": {
      "title": "You're Ready!",
      "message": "Based on your answers, you're an ideal fit...",
      "cta": "Book Your Free Consultation Now"
    },
    "medium": {
      "title": "You're Close!",
      "message": "You're on the right track but...",
      "cta": "Learn More About Our Program"
    },
    "low": {
      "title": "Let's Start Here",
      "message": "Based on your current situation...",
      "cta": "Download Our Free Guide"
    }
  }
}

The "correctAnswer" is the index (0-3) of the best answer that indicates they're a qualified lead.

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
          const aiData = JSON.parse(jsonMatch[0]);
          
          setFormData(prev => ({
            ...prev,
            questions: aiData.questions || prev.questions,
            resultMessages: aiData.resultMessages || prev.resultMessages
          }));

          alert('✨ AI generated your quiz! You can edit questions or generate HTML.');
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
    if (!formData.businessName || !formData.niche || !formData.quizTitle) {
      alert('Please fill in all required fields');
      return;
    }

    const hasEmptyQuestions = formData.questions.some(q => 
      !q.question || q.options.some(o => !o)
    );

    if (hasEmptyQuestions) {
      alert('Please fill in all questions and options');
      return;
    }

    if (!formData.resultMessages.high.title || !formData.resultMessages.medium.title || !formData.resultMessages.low.title) {
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
    <title>${formData.quizTitle} - ${formData.businessName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .progress-bar {
            background: #e0e0e0;
            height: 8px;
            border-radius: 10px;
            margin-bottom: 30px;
            overflow: hidden;
        }
        .progress-fill {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            transition: width 0.3s ease;
        }
        .question-container {
            display: none;
        }
        .question-container.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .question-text {
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }
        .option {
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 15px 20px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .option:hover {
            border-color: #667eea;
            background: #f0f4ff;
        }
        .option.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
        }
        .btn {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: transform 0.2s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .result-container {
            display: none;
            text-align: center;
        }
        .result-container.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        .result-title {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
        }
        .result-score {
            font-size: 48px;
            font-weight: bold;
            color: #764ba2;
            margin-bottom: 20px;
        }
        .result-message {
            font-size: 16px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .cta-button {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 18px;
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
            <h1>${formData.quizTitle}</h1>
            <p>${formData.businessName}${formData.quizDescription ? ' • ' + formData.quizDescription : ''}</p>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
        </div>

        <div id="quizContent">
            ${formData.questions.map((q, qIndex) => `
            <div class="question-container" data-question="${qIndex}">
                <div class="question-text">${qIndex + 1}. ${q.question}</div>
                ${q.options.map((option, oIndex) => `
                <div class="option" data-question="${qIndex}" data-option="${oIndex}">
                    ${String.fromCharCode(65 + oIndex)}) ${option}
                </div>
                `).join('')}
            </div>
            `).join('')}
        </div>

        <div class="result-container" id="resultContainer">
            <div class="result-title" id="resultTitle"></div>
            <div class="result-score" id="resultScore"></div>
            <div class="result-message" id="resultMessage"></div>
            <a href="#" class="cta-button" id="ctaButton"></a>
        </div>

        <button class="btn" id="nextBtn" disabled>Select an answer</button>

        <div class="footer">
            Powered by ${formData.businessName}
        </div>
    </div>

    <script>
        const quizData = ${JSON.stringify(formData)};
        let currentQuestion = 0;
        let answers = [];
        let score = 0;

        const questionContainers = document.querySelectorAll('.question-container');
        const nextBtn = document.getElementById('nextBtn');
        const progressFill = document.getElementById('progressFill');
        const resultContainer = document.getElementById('resultContainer');
        const quizContent = document.getElementById('quizContent');

        // Show first question
        questionContainers[0].classList.add('active');
        updateProgress();

        // Handle option selection
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                const qIndex = parseInt(this.dataset.question);
                const oIndex = parseInt(this.dataset.option);
                
                // Remove selection from other options
                document.querySelectorAll(\`.option[data-question="\${qIndex}"]\`).forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Select this option
                this.classList.add('selected');
                answers[qIndex] = oIndex;
                
                // Enable next button
                nextBtn.disabled = false;
                nextBtn.textContent = currentQuestion === quizData.questions.length - 1 ? 'See Results' : 'Next Question';
            });
        });

        // Handle next button
        nextBtn.addEventListener('click', function() {
            if (currentQuestion < quizData.questions.length - 1) {
                questionContainers[currentQuestion].classList.remove('active');
                currentQuestion++;
                questionContainers[currentQuestion].classList.add('active');
                nextBtn.disabled = true;
                nextBtn.textContent = 'Select an answer';
                updateProgress();
                
                // Check if this question was already answered
                if (answers[currentQuestion] !== undefined) {
                    document.querySelector(\`.option[data-question="\${currentQuestion}"][data-option="\${answers[currentQuestion]}"]\`).classList.add('selected');
                    nextBtn.disabled = false;
                    nextBtn.textContent = currentQuestion === quizData.questions.length - 1 ? 'See Results' : 'Next Question';
                }
            } else {
                showResults();
            }
        });

        function updateProgress() {
            const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
            progressFill.style.width = progress + '%';
        }

        function showResults() {
            // Calculate score
            quizData.questions.forEach((q, index) => {
                if (answers[index] === q.correctAnswer) {
                    score++;
                }
            });

            const percentage = (score / quizData.questions.length) * 100;
            let resultLevel;

            if (percentage >= 70) {
                resultLevel = 'high';
            } else if (percentage >= 40) {
                resultLevel = 'medium';
            } else {
                resultLevel = 'low';
            }

            const result = quizData.resultMessages[resultLevel];

            document.getElementById('resultTitle').textContent = result.title;
            document.getElementById('resultScore').textContent = \`\${score}/\${quizData.questions.length}\`;
            document.getElementById('resultMessage').textContent = result.message;
            document.getElementById('ctaButton').textContent = result.cta;

            quizContent.style.display = 'none';
            nextBtn.style.display = 'none';
            resultContainer.classList.add('active');
        }
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.quizTitle.replace(/\s+/g, '-').toLowerCase()}-quiz.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Interactive Quiz HTML Generated! Upload this file to your website.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Quiz Builder</h2>
        <p className="text-gray-600 mb-8">Create qualifying quizzes that identify your best prospects</p>

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
              placeholder="e.g., FitCoach Pro"
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

          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              name="quizTitle"
              value={formData.quizTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Are You Ready for Competition-Level Fitness?"
              required
            />
          </div>

          {/* Quiz Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quiz Description
            </label>
            <textarea
              name="quizDescription"
              value={formData.quizDescription}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Brief description of what this quiz helps identify..."
            />
          </div>

          {/* Questions */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Quiz Questions</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingAI ? '✨ Generating...' : '✨ Generate with AI'}
                </button>
                <button
                  onClick={addQuestion}
                  disabled={formData.questions.length >= 20}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  + Add Question
                </button>
              </div>
            </div>

            {formData.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Question {qIndex + 1}</h4>
                  {formData.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., How many hours per day can you dedicate to training?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Answer Options *
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2 mb-2">
                        <span className="flex items-center justify-center w-8 h-10 bg-gray-200 rounded text-sm font-semibold">
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Best Answer (Indicates Qualified Lead) *
                    </label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {question.options.map((_, oIndex) => (
                        <option key={oIndex} value={oIndex}>
                          {String.fromCharCode(65 + oIndex)}) {question.options[oIndex] || `Option ${String.fromCharCode(65 + oIndex)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Result Messages */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Result Messages</h3>
            
            {/* High Score */}
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-green-800 mb-3">High Score (70%+) - Hot Lead</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.resultMessages.high.title}
                  onChange={(e) => handleResultMessageChange('high', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., You're Ready!"
                  required
                />
                <textarea
                  value={formData.resultMessages.high.message}
                  onChange={(e) => handleResultMessageChange('high', 'message', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Message for qualified leads..."
                  required
                />
                <input
                  type="text"
                  value={formData.resultMessages.high.cta}
                  onChange={(e) => handleResultMessageChange('high', 'cta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Book Your Free Consultation"
                  required
                />
              </div>
            </div>

            {/* Medium Score */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-3">Medium Score (40-69%) - Warm Lead</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.resultMessages.medium.title}
                  onChange={(e) => handleResultMessageChange('medium', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., You're Close!"
                  required
                />
                <textarea
                  value={formData.resultMessages.medium.message}
                  onChange={(e) => handleResultMessageChange('medium', 'message', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Message for warm leads..."
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
              <h4 className="font-semibold text-red-800 mb-3">Low Score (Below 40%) - Cold Lead</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.resultMessages.low.title}
                  onChange={(e) => handleResultMessageChange('low', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Let's Start Here"
                  required
                />
                <textarea
                  value={formData.resultMessages.low.message}
                  onChange={(e) => handleResultMessageChange('low', 'message', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Message for cold leads..."
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
            Generate Interactive Quiz HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;