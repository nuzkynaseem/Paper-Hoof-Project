import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import GravityCanvas from './GravityCanvas';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="compact-footer" data-testid="site-footer">
      {/* GSAP + Matter.js Gravity Shapes Playground — Touches Very Top of Footer */}
      <GravityCanvas />

      <div className="compact-footer-inner">
        {/* Middle Section: Email Statement & Social Media Buttons */}
        <div className="compact-middle-block">
          <div className="email-cta-row">
            <h3 className="compact-headline">LET'S TALK DESIGN</h3>
            <a
              href="mailto:hello@paperhoof.com"
              className="compact-email-link"
              aria-label="Email hello@paperhoof.com"
            >
              <span>hello@paperhoof.com</span>
              <ArrowUpRight size={24} />
            </a>
          </div>

          {/* Direct Social Media Buttons Just Below Email */}
          <div className="footer-social-buttons">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} />
              <span>Instagram</span>
              <ArrowUpRight size={14} className="social-btn-arrow" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
              <span>LinkedIn</span>
              <ArrowUpRight size={14} className="social-btn-arrow" />
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
