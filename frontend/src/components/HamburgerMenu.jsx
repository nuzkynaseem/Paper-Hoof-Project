import React from 'react';
import { X, Instagram, Music, MessageCircle, Linkedin } from 'lucide-react';
import { navigationLinks } from '../mock';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClose, onBrandReviewClick }) => {
  if (!isOpen) return null;

  const handleNavClick = (path) => {
    if (path === '/brand-review') {
      onBrandReviewClick();
    }
    onClose();
  };

  return (
    <div className="hamburger-menu-overlay">
      <button className="menu-close-btn" onClick={onClose}>
        <X size={32} />
      </button>

      <div className="menu-content">
        <div className="menu-left">
          <nav className="menu-nav">
            {navigationLinks.map((link, index) => (
              <button
                key={index}
                className="menu-nav-item"
                onClick={() => handleNavClick(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="menu-right">
          <div className="menu-section">
            <h3 className="menu-section-title">Social</h3>
            <div className="menu-social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="menu-social-item">
                <Instagram size={18} />
                <span>Instagram</span>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="menu-social-item">
                <Music size={18} />
                <span>TikTok</span>
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="menu-social-item">
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="menu-social-item">
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="menu-section">
            <h3 className="menu-section-title">Email</h3>
            <a href="mailto:branfern@gmail.com" className="menu-contact-item">
              branfern@gmail.com
            </a>
          </div>

          <div className="menu-section">
            <h3 className="menu-section-title">Location</h3>
            <p className="menu-location-item">Mawanella, Sri Lanka</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;