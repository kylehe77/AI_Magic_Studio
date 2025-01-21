import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="main-header">
      <nav className="nav-container">
        <div className="logo-section">
          <span className="logo">🎨</span>
          <span className="brand-name">AI Magic Studio</span>
        </div>
        
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>

        <div className="auth-buttons">
          <button className="btn btn-login">Log In</button>
          <button className="btn btn-signup">Sign Up</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
