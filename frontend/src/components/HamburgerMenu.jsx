import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { X, Share2, ArrowUpRight, Copy, Check, Calendar } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import { navigationLinks } from '../mock';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const socialsRef = useRef(null);
  const tlRef = useRef(null);
  const enterEndTimeRef = useRef(0);
  const isMountedRef = useRef(false);

  // Initialize GSAP Timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set("#nav", { visibility: "hidden", pointerEvents: "none" });
      gsap.set(".nav-bg", { opacity: 0 });
      gsap.set(".nav-login", { opacity: 0, y: 8 });

      const tl = gsap.timeline({ paused: true })
        .set("#nav", { visibility: "visible", pointerEvents: "auto" })
        
        // ═══ ENTER ═══
        .to(".nav-bg", {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }, 0)

        .fromTo(".nav-panel", 
          { x: "110%", y: 0, rotation: 0 },
          {
            x: "0%",
            y: 0,
            duration: 0.6,
            ease: "back.out(1.1)",
            stagger: 0.1,
          }, 
          0
        )

        .fromTo(".nav-item",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.03
          },
          0.12
        )

        .fromTo(".bar-top",
          { attr: { x1: 3, y1: 10, x2: 17, y2: 10 } },
          {
            attr: { x1: 4, y1: 4, x2: 16, y2: 16 },
            duration: 0.35,
            ease: "back.out(1.4)"
          },
          0.06
        )
        .fromTo(".bar-bot",
          { attr: { x1: 10, y1: 3, x2: 10, y2: 17 } },
          {
            attr: { x1: 16, y1: 4, x2: 4, y2: 16 },
            duration: 0.35,
            ease: "back.out(1.4)"
          },
          0.06
        )

        .to(".nav-login", {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power3.out"
        }, 0.35)

        // ═══ PAUSE ═══
        .addPause();

      enterEndTimeRef.current = tl.duration();

      // ═══ EXIT — panels fall down with stagger, bottom first ═══
      tl
        .to(".bar-top", {
          attr: { x1: 3, y1: 10, x2: 17, y2: 10 },
          duration: 0.25,
          ease: "power3.in"
        }, "<")
        .to(".bar-bot", {
          attr: { x1: 10, y1: 3, x2: 10, y2: 17 },
          duration: 0.25,
          ease: "power3.in"
        }, "<")

        .to(".nav-panel", {
          y: "110vh",
          rotation: () => (Math.random() - 0.5) * 35,
          duration: 0.75,
          ease: "power3.in",
          stagger: {
            from: "end",
            each: 0.04
          }
        }, "<")

        .to(".nav-bg", {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        }, "<0.1")

        .set("#nav", { visibility: "hidden", pointerEvents: "none" });

      tlRef.current = tl;
    });

    return () => ctx.revert();
  }, []);

  // Trigger GSAP Timeline Play/Reverse on `isOpen` prop change
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    const enterEndTime = enterEndTimeRef.current;

    if (isOpen) {
      isMountedRef.current = true;
      if (tl.time() >= enterEndTime) {
        tl.timeScale(1).restart();
      } else {
        tl.timeScale(1).play();
      }
    } else {
      if (isMountedRef.current) {
        if (tl.time() < enterEndTime) {
          tl.timeScale(1.5).reverse();
        } else {
          tl.timeScale(1).play();
        }
      }
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

              {/* Email Contact Block (.nav-login for staggered entrance) */}
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

              {/* Location & CTAs (.nav-login) */}
              <div className="nav-login secondary-section">
                <span className="section-small-title">STUDIO LOCATION</span>
                <p className="location-text">Mawanella, Sri Lanka</p>
              </div>

              {/* Brand Review CTA Action (.nav-login) */}
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
              <span className="brand-block-tagline">CRAFTING BOLD DIGITAL EXPERIENCES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;