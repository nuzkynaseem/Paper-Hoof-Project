import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Share2 } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import GravityCanvas from './GravityCanvas';
import './Footer.css';

const Footer = () => {
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const socialsRef = useRef(null);

  // Close tooltip on touch / click outside (Mobile & Desktop fallback)
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="compact-footer" data-testid="site-footer">
      <div className="compact-footer-inner">
        {/* Top Header: Live Availability & Socials Tooltip Pill */}
        <div className="compact-top-bar">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span className="status-text">AVAILABLE FOR SELECT PROJECTS 2026</span>
          </div>

          {/* Socials Unfurling Tooltip Pill */}
          <div
            className="socials-pill-wrapper"
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
              data-testid="socials-pill-btn"
            >
              <Share2 size={16} />
              <span>Socials</span>
              <span className="pill-badge-count">2</span>
            </button>

            {/* Unfurling Tooltip Container */}
            <div
              className={`socials-tooltip-container ${isSocialsOpen ? 'unfurled' : ''}`}
              role="tooltip"
              data-testid="socials-tooltip"
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
                  <InstagramIcon size={18} />
                  <span>Instagram</span>
                  <ArrowUpRight size={14} className="link-arrow" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tooltip-link-item"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon size={18} />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={14} className="link-arrow" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* GSAP + Matter.js Gravity Shapes Playground — Between Status Note & LET'S TALK BRANDING */}
        <GravityCanvas />

        {/* Middle Section: Email Statement */}
        <div className="compact-middle-block">
          <div className="email-cta-row">
            <h3 className="compact-headline">LET'S TALK BRANDING</h3>
            <a
              href="mailto:hello@paperhoof.com"
              className="compact-email-link"
              aria-label="Email hello@paperhoof.com"
            >
              <span>hello@paperhoof.com</span>
              <ArrowUpRight size={24} />
            </a>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="compact-bottom-bar">
          <div className="copyright-info">
            © {new Date().getFullYear()} Paper Hoof Studio. All rights reserved.
          </div>

          <div className="brand-stamp">PAPER HOOF</div>

          <button
            type="button"
            className="scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>BACK TO TOP</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
