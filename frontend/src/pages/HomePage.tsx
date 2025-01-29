import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      name: 'Image Processing',
      icon: '🖼️',
      description: 'Remove backgrounds, edit, and transform images with AI-powered tools',
      path: '/image-processor'
    },
    {
      name: 'Text Processing',
      icon: '📝',
      description: 'Generate, edit, and enhance text using advanced AI capabilities',
      path: '/text-processor'
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">
      <header className="hero-section">
        <h1>AI Magic Studio</h1>
        <p>Unleash the power of AI for creative image and text processing</p>
      </header>

      <section className="features-grid">
        {features.map((feature) => (
          <div 
            key={feature.path} 
            className="feature-card"
            onClick={() => handleFeatureClick(feature.path)}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h2>{feature.name}</h2>
            <p>{feature.description}</p>
            <span className="feature-cta">Explore Now →</span>
          </div>
        ))}
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Choose Your Tool</h3>
            <p>Select either Image or Text Processing from our feature grid</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Upload or Input</h3>
            <p>Upload an image or paste your text into our AI-powered interface</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Get Instant Results</h3>
            <p>Receive transformed content with just a single click</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
