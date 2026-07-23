import React from 'react';
import { Instagram, Music, MessageCircle, Linkedin, ArrowUp } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Main Footer Block */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Left Column - Oversized Brand Mark */}
          <div className="footer-col footer-col-left">
            <div className="footer-brand-mark">
              <img
                src={`${process.env.PUBLIC_URL}/paperhoof-logo.svg`}
                alt="Paper Hoof"
                className="brand-mark-svg"
              />
            </div>
          </div>

          {/* Vertical Divider 1 */}
          <div className="footer-divider-vertical"></div>

          {/* Middle Column - Paper Hoof Wordmark */}
          <div className="footer-col footer-col-middle">
            <h2 className="footer-wordmark">Paper Hoof</h2>
          </div>

          {/* Vertical Divider 2 */}
          <div className="footer-divider-vertical"></div>

          {/* Right Column - Contact Info */}
          <div className="footer-col footer-col-right">
            <div className="footer-contact-section">
              <h3 className="footer-contact-heading">Get in Touch</h3>
              <div className="footer-social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <Instagram size={20} />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <Music size={20} />
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <MessageCircle size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            <div className="footer-contact-section">
              <h3 className="footer-contact-heading">Contact Us</h3>
              <a href="mailto:hello@paperhoof.com" className="footer-contact-link">
                hello@paperhoof.com
              </a>
            </div>

            <div className="footer-contact-section">
              <h3 className="footer-contact-heading">Location</h3>
              <p className="footer-contact-text">Mawanella, Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="footer-divider-horizontal"></div>

      {/* Bottom Navigation Strip */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <nav className="footer-nav">
            <a href="/" className="footer-nav-link">HOME</a>
            <a href="/brand-review" className="footer-nav-link">BRAND REVIEW</a>
            <a href="/about" className="footer-nav-link">ABOUT</a>
            <a href="/work" className="footer-nav-link">WORK</a>
            <a href="/contact" className="footer-nav-link">CONTACT</a>
          </nav>

          <button className="footer-scroll-top" onClick={scrollToTop}>
            <ArrowUp size={20} />
            <span>Scroll Up</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
