import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import GravityCanvas from './GravityCanvas';
import { API_BASE } from '../utils/api';
import './Footer.css';

const Footer = () => {
  const [socials, setSocials] = useState({
    email: 'hello@paperhoof.com',
    instagramUrl: 'https://instagram.com',
    linkedinUrl: 'https://linkedin.com',
  });

  useEffect(() => {
    fetchSocialsData();
  }, []);

  const fetchSocialsData = async () => {
    try {
      const res = await fetch(`${API_BASE}/site/socials`);
      if (res.ok) {
        const data = await res.json();
        setSocials({
          email: data.email || 'hello@paperhoof.com',
          instagramUrl: data.instagramUrl || 'https://instagram.com',
          linkedinUrl: data.linkedinUrl || 'https://linkedin.com',
        });
      }
    } catch (e) {
      console.warn("Using default footer socials");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="compact-footer" data-testid="site-footer">
      <GravityCanvas />

      <div className="compact-footer-inner">
        <div className="compact-middle-block">
          <div className="email-cta-row">
            <h3 className="compact-headline">LET'S TALK DESIGN</h3>
            <a
              href={`mailto:${socials.email}`}
              className="compact-email-link"
              aria-label={`Email ${socials.email}`}
            >
              <span>{socials.email}</span>
              <ArrowUpRight size={24} />
            </a>
          </div>

          <div className="footer-social-buttons">
            <a
              href={socials.instagramUrl}
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
              href={socials.linkedinUrl}
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

        <div className="compact-bottom-bar">
          <div className="copyright-info">
            © {new Date().getFullYear()} Paper Hoof Studio. All rights reserved.
          </div>

          <div className="brand-stamp">
            <img
              src={`${process.env.PUBLIC_URL}/paperhoof-wordmark.svg`}
              alt="Paper Hoof Studio"
              className="footer-wordmark-img"
            />
          </div>

          <button
            type="button"
            className="scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={16} className="scroll-top-arrow" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
