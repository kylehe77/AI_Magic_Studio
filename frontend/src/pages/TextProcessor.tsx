import React, { useState } from 'react';
import './TextProcessor.css';

const TextProcessor: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [processingType, setProcessingType] = useState<'summarize' | 'translate' | 'social-content'>('summarize');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Translation specific states
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  
  // Social content specific states
  const [platform, setPlatform] = useState('general');
  const [tone, setTone] = useState('engaging');
  const [keywords, setKeywords] = useState('');

  const languageOptions = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ko', name: '한국어' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' }
  ];

  const processingOptions = [
    { 
      type: 'summarize', 
      label: 'Summarize', 
      icon: '📝',
      description: 'Generate concise summaries of long texts',
      gradient: 'from-blue-500 to-teal-400'
    },
    { 
      type: 'translate', 
      label: 'Translate', 
      icon: '🌐',
      description: 'Translate text between multiple languages',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      type: 'social-content', 
      label: 'Social Content', 
      icon: '📱',
      description: 'Generate engaging social media posts',
      gradient: 'from-green-400 to-blue-500'
    }
  ];

  const handleProcess = async () => {
    if (!inputText) return;
    
    setIsProcessing(true);
    setProcessedText('Processing...');

    try {
      let endpoint = `${process.env.REACT_APP_API_URL}/api/text/${processingType}`;
      let body: any = { text: inputText };

      switch(processingType) {
        case 'translate':
          body = { 
            text: inputText, 
            sourceLanguage, 
            targetLanguage 
          };
          break;
        case 'social-content':
          body = {
            topic: inputText,
            platform,
            tone,
            keywords: keywords.split(',').map(k => k.trim())
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Processing failed: ${errorText}`);
      }

      const data = await response.json();
      
      switch(processingType) {
        case 'summarize':
          setProcessedText(data.summary);
          break;
        case 'translate':
          setProcessedText(data.translation);
          break;
        case 'social-content':
          setProcessedText(
            `Headline: ${data.headline}\n\n` +
            `Content: ${data.body}\n\n` +
            `Hashtags: ${data.hashtags.join(' ')}`
          );
          break;
      }
    } catch (error) {
      console.error('Error processing text:', error);
      setProcessedText('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAdditionalControls = () => {
    switch(processingType) {
      case 'translate':
        return (
          <div className="translation-controls">
            <select 
              value={sourceLanguage} 
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              <option value="auto">Detect Language</option>
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        );
      case 'social-content':
        return (
          <div className="social-content-controls">
            <select 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="general">General</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="engaging">Engaging</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="inspirational">Inspirational</option>
            </select>
            <input 
              type="text" 
              placeholder="Keywords (comma-separated)" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-processor-container">
      <div className="text-processor-header">
        <h1>AI Text Processing</h1>
        <p>Enhance and transform your text with AI-powered tools</p>
      </div>

      <div className="processing-selector">
        {processingOptions.map((option) => (
          <div 
            key={option.type}
            className={`processing-option ${processingType === option.type ? 'active' : ''} 
              transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            onClick={() => setProcessingType(option.type as any)}
            style={{
              background: processingType === option.type 
                ? `linear-gradient(145deg, #e6f2ff, #ffffff)` 
                : 'var(--background-color)',
              boxShadow: processingType === option.type 
                ? '0 10px 20px rgba(0,0,0,0.1)' 
                : '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <span 
              className="processing-icon transform transition-transform duration-300 group-hover:rotate-12"
            >
              {option.icon}
            </span>
            <div className="processing-details">
              <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                {option.label}
              </h3>
              <p className="text-sm text-gray-500 transition-colors duration-300">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {renderAdditionalControls()}

      <div className="text-processing-area">
        <div className="input-section">
          <textarea 
            placeholder={
              processingType === 'summarize' ? 'Enter text to summarize' :
              processingType === 'translate' ? 'Enter text to translate' :
              'Enter topic for social media content'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <button 
          onClick={handleProcess} 
          disabled={isProcessing || !inputText}
          className={`
            transform transition-all duration-300 
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            ${!inputText ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg 
                className="animate-spin h-5 w-5 mr-3" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Process'
          )}
        </button>
        <div className="output-section">
          <textarea 
            readOnly 
            value={processedText}
            placeholder="Processed result will appear here"
          />
        </div>
      </div>

    </div>
  );
};

export default TextProcessor;
