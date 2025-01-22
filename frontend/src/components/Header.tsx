import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    { 
      name: 'Image Processing', 
      icon: '🖼️', 
      description: 'Remove backgrounds, edit, and transform images',
      path: '/image-processor'
    },
    { 
      name: 'Text Processing', 
      icon: '📝', 
      description: 'Generate, edit, and enhance text with AI',
      path: '/text-processor'
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
    setIsFeatureDropdownOpen(false);
  };

  return (
    <header className="main-header">
      <nav className="nav-container">
        <Link to="/" className="logo-section">
          <span className="logo">🎨</span>
          <span className="brand-name">AI Magic Studio</span>
        </Link>
        
        <div className="nav-links">
          <div 
            className="nav-link features-dropdown"
            onMouseEnter={() => setIsFeatureDropdownOpen(true)}
            onMouseLeave={() => setIsFeatureDropdownOpen(false)}
          >
            Features
            <span className={`dropdown-icon ${isFeatureDropdownOpen ? 'rotate' : ''}`}>
              ▼
            </span>

            {isFeatureDropdownOpen && (
              <div 
                className="features-dropdown-menu"
                onMouseEnter={() => setIsFeatureDropdownOpen(true)}
                onMouseLeave={() => setIsFeatureDropdownOpen(false)}
              >
                {features.map((feature) => (
                  <div 
                    key={feature.name} 
                    className="dropdown-item"
                    onClick={() => handleFeatureClick(feature.path)}
                  >
                    <span className="feature-icon">{feature.icon}</span>
                    <div className="feature-details">
                      <h3>{feature.name}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
