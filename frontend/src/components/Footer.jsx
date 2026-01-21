import React from 'react';
import { Instagram, Music, MessageCircle, Linkedin, ArrowUp } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <rect x="30" y="45" width="60" height="45" fill="currentColor" />
              <path d="M45 30 L60 15 L75 30" stroke="currentColor" strokeWidth="6" />
              <circle cx="60" cy="67.5" r="7.5" fill="var(--bg-cream)" />
            </svg>
          </div>
          <h2 className="footer-brand">Branfern</h2>
          <nav className="footer-nav">
            <a href="/" className="footer-link">HOME</a>
            <a href="/brand-review" className="footer-link">BRAND REVIEW</a>
            <a href="/about" className="footer-link">ABOUT</a>
            <a href="/work" className="footer-link">WORK</a>
            <a href="/contact" className="footer-link">CONTACT</a>
          </nav>
        </div>

        <div className="footer-right">
          <div className="footer-section">
            <h3 className="footer-heading">Get in Touch</h3>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Instagram size={20} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Music size={20} />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <MessageCircle size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <a href="mailto:branfern@gmail.com" className="footer-contact">
              branfern@gmail.com
            </a>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Location</h3>
            <p className="footer-location">Mawanella, Sri Lanka</p>
          </div>
        </div>
      </div>

      <button className="scroll-top" onClick={scrollToTop}>
        <ArrowUp size={24} />
        <span>Scroll Up</span>
      </button>
    </footer>
  );
};

export default Footer;