import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { X, ArrowUpRight, Copy, Check, Calendar } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import { navigationLinks } from '../mock';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Robust GSAP animation on isOpen prop change
  useEffect(() => {
    if (isOpen) {
      // Kill any running tweens to prevent stale animation states
      gsap.killTweensOf(['#nav', '.nav-bg', '.nav-panel', '.nav-item', '.nav-login']);

      // Ensure menu container is visible & interactive
      gsap.set('#nav', { visibility: 'visible', pointerEvents: 'auto' });
      gsap.set('.nav-panel', { y: 0, rotation: 0, opacity: 1 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.nav-bg',
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' },
        0
      )
        .fromTo(
          '.nav-panel',
          { x: '105%', opacity: 1 },
          { x: '0%', opacity: 1, duration: 0.55, ease: 'back.out(1.1)', stagger: 0.08 },
          0
        )
        .fromTo(
          '.nav-item',
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out', stagger: 0.04 },
          0.12
        )
        .fromTo(
          '.nav-login',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.04 },
          0.22
        );
    } else {
      gsap.killTweensOf(['#nav', '.nav-bg', '.nav-panel', '.nav-item', '.nav-login']);

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set('#nav', { visibility: 'hidden', pointerEvents: 'none' });
          gsap.set('.nav-panel', { x: '105%', y: 0, rotation: 0, opacity: 1 });
        },
      });

      tl.to(
        '.nav-panel',
        {
          y: '100vh',
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
          stagger: { from: 'end', each: 0.04 },
        },
        0
      ).to(
        '.nav-bg',
        { opacity: 0, duration: 0.3, ease: 'power2.in' },
        0.1
      );
    }
  }, [isOpen]);

  // Keyboard Escape listener
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

  const handleNavClick = (path) => {
    navigate(path);
    onClose();
  };

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('paperhoof@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div
      id="nav"
      className="hamburger-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Dark Blur Backdrop */}
      <div className="nav-bg" onClick={onClose} aria-hidden="true" />

      {/* Floating Close Button Header inside Overlay */}
      <div className="overlay-header">
        <button
          className="menu-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <X size={26} />
        </button>
      </div>

      {/* Panels Container */}
      <div className="nav-panels-container">
        {/* Block 1 / Panel 1: Primary Navigation */}
        <div className="nav-panel nav-panel-primary">
          <div className="panel-badge">
            <span className="badge-dot" />
            <span className="badge-text">NAVIGATION</span>
            <span className="badge-num">01</span>
          </div>

          <nav className="panel-nav-list" aria-label="Overlay Primary Navigation">
            {navigationLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={index}
                  className={`nav-item nav-link-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.path)}
                >
                  <span className="item-label">{link.label}</span>
                  <ArrowUpRight size={18} className="item-arrow" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column: Panel 2 (Secondary) & Panel 3 (Brand Wordmark Block) */}
        <div className="nav-panel-column-secondary">
          {/* Block 2 / Panel 2: Secondary / Socials & Connect Block */}
          <div className="nav-panel nav-panel-secondary">
            <div className="panel-badge light">
              <span className="badge-dot light" />
              <span className="badge-text light">CONNECT & REACH</span>
              <span className="badge-num light">02</span>
            </div>

            <div className="secondary-panel-content">
              {/* Direct Social Links Grid */}
              <div className="nav-item secondary-section">
                <span className="section-small-title">SOCIAL PRESENCE</span>
                
                <div className="panel-socials-grid">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel-social-link"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={16} />
                    <span>Instagram</span>
                    <ArrowUpRight size={14} className="panel-social-arrow" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel-social-link"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon size={16} />
                    <span>LinkedIn</span>
                    <ArrowUpRight size={14} className="panel-social-arrow" />
                  </a>
                </div>
              </div>

              {/* Email Contact Block */}
              <div className="nav-login secondary-section">
                <span className="section-small-title">DIRECT INQUIRIES</span>
                <div className="email-box" onClick={handleCopyEmail}>
                  <a href="mailto:paperhoof@gmail.com" onClick={(e) => e.stopPropagation()} className="email-link">
                    paperhoof@gmail.com
                  </a>
                  <button
                    type="button"
                    className="email-copy-btn"
                    onClick={handleCopyEmail}
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  </button>
                </div>
                {copiedEmail && <span className="copied-toast">Email copied to clipboard!</span>}
              </div>

              {/* Location */}
              <div className="nav-login secondary-section">
                <span className="section-small-title">STUDIO LOCATION</span>
                <p className="location-text">Mawanella, Sri Lanka</p>
              </div>

              {/* Brand Review CTA Action */}
              <div className="nav-login cta-action-wrapper">
                <button
                  type="button"
                  className="panel-cta-btn"
                  onClick={() => handleNavClick('/brand-review')}
                >
                  <Calendar size={18} />
                  <span>Reserve 120-Min Review</span>
                </button>
              </div>
            </div>
          </div>

          {/* Block 3 / Panel 3: Brand Wordmark Block (Separate Block Below Connect & Reach) */}
          <div className="nav-panel nav-panel-brand">
            <div className="brand-block-badge">
              <span className="badge-dot light" />
              <span className="badge-text light">PAPER HOOF STUDIO</span>
              <span className="badge-num light">03</span>
            </div>
            <div className="brand-block-content">
              <img
                src={`${process.env.PUBLIC_URL}/paperhoof-wordmark.svg`}
                alt="Paper Hoof"
                className="brand-block-logo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;