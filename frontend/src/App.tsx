import React from 'react';
import Header from './components/Header';
import ImageProcessor from './components/ImageProcessor';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <section className="hero-section">
          <h1>Transform Your Images with AI</h1>
          <p>Remove backgrounds from images instantly using our advanced AI technology</p>
        </section>
        <ImageProcessor />
        <section className="features-section" id="features">
          <h2>Why Choose Our AI Background Remover?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Lightning Fast</h3>
              <p>Process images in seconds with our optimized AI engine</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>High Precision</h3>
              <p>Get pixel-perfect results with advanced edge detection</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔄</span>
              <h3>Batch Processing</h3>
              <p>Process multiple images at once to save time</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <p>&copy; 2025 AI Magic Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
