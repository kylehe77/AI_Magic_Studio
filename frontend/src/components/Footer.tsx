import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: '🌐', 
      url: 'https://www.facebook.com/kyle.he.98622' 
    },
    { 
      name: 'LinkedIn', 
      icon: '💼', 
      url: 'https://www.linkedin.com/in/tianhua-he/' 
    },
    { 
      name: 'GitHub', 
      icon: '💻', 
      url: 'https://github.com/kylehe77' 
    }
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Text Processing', path: '/text-processor' }
  ];

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section brand">
          <div className="footer-logo">
            <span role="img" aria-label="AI Magic Studio Logo">✨</span>
            <h3>AI Magic Studio</h3>
          </div>
          <p>Empowering creativity through AI-driven tools</p>
          <div className="social-links">
            {socialLinks.map((social) => (
              <a 
                key={social.name} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <div className="footer-links">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.path}>{link.name}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} AI Magic Studio. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
