import React, { useState } from 'react';
import { Instagram, Music, MessageCircle, Linkedin, ArrowUp, X, ChevronUp } from 'lucide-react';
import { designCategories, projects } from '../mock';
import './Footer.css';

const Footer = ({ showDockedRectangle = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRectangleClick = () => {
    if (showDockedRectangle) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setHoveredCategory(null);
  };

  const getProjectForCategory = (category) => {
    const matchingProject = projects.find(p => 
      p.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
    );
    return matchingProject || projects[0];
  };

  return (
    <>
      {/* Expanded Overlay from Footer */}
      {isExpanded && (
        <div className="design-categories-overlay" onClick={handleClose}>
          <div 
            className="categories-panel-new"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn-new" onClick={handleClose}>
              <X size={20} />
            </button>
            
            <div className="expanded-title">
              <span>We Design</span>
              <span className="bullet">•</span>
              <span>Everything</span>
            </div>
            
            <div className="categories-grid">
              {designCategories.map((category, index) => (
                <button 
                  key={index} 
                  className={`category-btn ${hoveredCategory === category ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {category} +
                </button>
              ))}
            </div>
            
            <div className="preview-container">
              {hoveredCategory ? (
                <div className="preview-content">
                  <img 
                    src={getProjectForCategory(hoveredCategory).image} 
                    alt={hoveredCategory}
                    className="preview-image"
                  />
                  <div className="preview-overlay">
                    <span className="preview-label">{hoveredCategory}</span>
                  </div>
                </div>
              ) : (
                <div className="preview-placeholder">
                  <span>Hover over a category</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            {/* Zone A - Docking Area */}
            <div className="footer-dock-zone">
              {showDockedRectangle ? (
                <div className="footer-docked-rectangle" onClick={handleRectangleClick}>
                  <span>We Design</span>
                  <span className="bullet">•</span>
                  <span>Everything</span>
                  <ChevronUp className="arrow-icon-footer" size={20} />
                </div>
              ) : (
                <div className="footer-dock-placeholder"></div>
              )}
            </div>

            {/* Zone B - Navigation Links */}
            <nav className="footer-nav">
              <a href="/" className="footer-nav-link">HOME</a>
              <a href="/brand-review" className="footer-nav-link">BRAND REVIEW</a>
              <a href="/about" className="footer-nav-link">ABOUT</a>
              <a href="/work" className="footer-nav-link">WORK</a>
              <a href="/contact" className="footer-nav-link">CONTACT</a>
            </nav>

            {/* Zone C - Scroll to Top */}
            <button className="footer-scroll-top" onClick={scrollToTop}>
              <ArrowUp size={20} />
              <span>Scroll Up</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;