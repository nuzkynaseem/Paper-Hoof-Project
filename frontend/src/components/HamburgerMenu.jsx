import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Instagram, Music, MessageCircle, Linkedin, Share2, ArrowUpRight } from 'lucide-react';
import { navigationLinks } from '../mock';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const socialsRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch & Click Outside listener for Mobile/Desktop
  useEffect(() => {
    if (!isSocialsOpen) return;

    const handleTouchOrClickOutside = (event) => {
      if (socialsRef.current && !socialsRef.current.contains(event.target)) {
        setIsSocialsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleTouchOrClickOutside);
    document.addEventListener('touchstart', handleTouchOrClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleTouchOrClickOutside);
      document.removeEventListener('touchstart', handleTouchOrClickOutside);
    };
  }, [isSocialsOpen]);

  if (!isOpen) return null;

  const handleNavClick = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      className="hamburger-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      id="hamburger-menu"
    >
      <button
        className="menu-close-btn"
        onClick={onClose}
        aria-label="Close navigation menu"
      >
        <X size={32} aria-hidden="true" />
      </button>

      <div className="menu-content">
        <div className="menu-left">
          <nav className="menu-nav" aria-label="Overlay Navigation">
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
            
            {/* Socials Unfurling Tooltip Pill */}
            <div
              className="socials-pill-wrapper menu-socials-wrapper"
              ref={socialsRef}
              onMouseEnter={() => setIsSocialsOpen(true)}
              onMouseLeave={() => setIsSocialsOpen(false)}
            >
              <button
                type="button"
                className={`socials-pill-btn ${isSocialsOpen ? 'active' : ''}`}
                onClick={() => setIsSocialsOpen(!isSocialsOpen)}
                aria-expanded={isSocialsOpen}
                aria-label="Toggle Socials menu"
              >
                <Share2 size={16} />
                <span>Socials</span>
                <span className="pill-badge-count">4</span>
              </button>

              {/* Unfurling Tooltip Container */}
              <div
                className={`socials-tooltip-container ${isSocialsOpen ? 'unfurled' : ''}`}
                role="tooltip"
              >
                <div className="tooltip-header">
                  <span>CONNECT WITH US</span>
                </div>
                <div className="tooltip-links">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tooltip-link-item"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                    <span>Instagram</span>
                    <ArrowUpRight size={14} className="link-arrow" />
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tooltip-link-item"
                    aria-label="TikTok"
                  >
                    <Music size={18} />
                    <span>TikTok</span>
                    <ArrowUpRight size={14} className="link-arrow" />
                  </a>
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tooltip-link-item"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                    <ArrowUpRight size={14} className="link-arrow" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tooltip-link-item"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                    <span>LinkedIn</span>
                    <ArrowUpRight size={14} className="link-arrow" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="menu-section">
            <h3 className="menu-section-title">Email</h3>
            <a href="mailto:hello@paperhoof.com" className="menu-contact-item">
              hello@paperhoof.com
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