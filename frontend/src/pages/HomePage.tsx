import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <>
      <section className="hero-section">
        <h1>Transform Your Content with AI</h1>
        <p>Powerful AI tools to enhance your images and text</p>
      </section>

      <section className="features-grid">
        <div className="feature-entry">
          <Link to="/image-processor" className="feature-link">
            <div className="feature-icon">🖼️</div>
            <h2>Image Processing</h2>
            <p>Remove backgrounds, edit, and transform images</p>
          </Link>
        </div>

        <div className="feature-entry">
          <Link to="/text-processor" className="feature-link">
            <div className="feature-icon">📝</div>
            <h2>Text Processing</h2>
            <p>Generate, edit, and enhance text with AI</p>
          </Link>
        </div>
      </section>

      <section className="features-details">
        <div className="feature-card">
          <span className="feature-detail-icon">⚡</span>
          <h3>Lightning Fast</h3>
          <p>Process content in seconds with our optimized AI engine</p>
        </div>
        <div className="feature-card">
          <span className="feature-detail-icon">🎯</span>
          <h3>High Precision</h3>
          <p>Get pixel-perfect and context-aware results</p>
        </div>
        <div className="feature-card">
          <span className="feature-detail-icon">🔄</span>
          <h3>Batch Processing</h3>
          <p>Handle multiple items simultaneously</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 AI Magic Studio. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;
