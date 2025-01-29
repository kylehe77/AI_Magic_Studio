import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: '🐦', 
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
    { name: 'Text Processing', path: '/text-processor' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
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
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          {quickLinks.map((link) => (
            <Link key={link.name} to={link.path} className="footer-link">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <p>Email: kyleh77@gmail.com</p>
          <p>Phone: +1 (23) 123-4567</p>
        </div>

        <div className="footer-section newsletter">
          <h4>Stay Updated</h4>
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} AI Magic Studio. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
