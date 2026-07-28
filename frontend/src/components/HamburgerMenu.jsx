import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { X, Instagram, Music, MessageCircle, Linkedin, Share2, ArrowUpRight, ArrowRight, Mail, MapPin } from 'lucide-react';
import { navigationLinks } from '../mock';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const socialsRef = useRef(null);
  const menuContainerRef = useRef(null);
  const timelineRef = useRef(null);

  // Initialize GSAP Timeline matching the exact animation specification
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial hidden states
      gsap.set("#hamburger-nav-overlay", { visibility: "hidden", pointerEvents: "none" });
      gsap.set(".nav-bg", { opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set("#hamburger-nav-overlay", { visibility: "hidden", pointerEvents: "none" });
        }
      });

      tl
        .set("#hamburger-nav-overlay", { visibility: "visible", pointerEvents: "auto" })

        // ═══ ENTER ═══
        .to(".nav-bg", {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }, 0)

        .fromTo(".nav-panel", {
          x: "110%",
          y: "0%",
          rotation: 0
        }, {
          x: "0%",
          y: "0%",
          duration: 0.6,
          ease: "back.out(1.1)",
          stagger: 0.1
        }, 0)

        .fromTo(".nav-item", {
          opacity: 0,
          x: -20
        }, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.04
        }, 0.15)

        .fromTo(".nav-secondary-content", {
          opacity: 0,
          y: 16
        }, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out"
        }, 0.3)

        .fromTo(".bar-top", {
          stroke: "#FFFFFF",
          attr: { x1: 3, y1: 7, x2: 17, y2: 7 }
        }, {
          stroke: "#FFFFFF",
          attr: { x1: 5, y1: 5, x2: 15, y2: 15 },
          duration: 0.35,
          ease: "back.out(1.4)"
        }, 0.06)

        .fromTo(".bar-bot", {
          stroke: "#FFFFFF",
          attr: { x1: 3, y1: 13, x2: 17, y2: 13 }
        }, {
          stroke: "#FFFFFF",
          attr: { x1: 15, y1: 5, x2: 5, y2: 15 },
          duration: 0.35,
          ease: "back.out(1.4)"
        }, 0.06)

        // ═══ PAUSE AT OPEN ═══
        .addPause("enterEnd");

      // ═══ EXIT — panels fall down with stagger, bottom panel falls first ═══
      tl
        .to(".bar-top", {
          attr: { x1: 3, y1: 7, x2: 17, y2: 7 },
          duration: 0.25,
          ease: "power3.in"
        })
        .to(".bar-bot", {
          attr: { x1: 3, y1: 13, x2: 17, y2: 13 },
          duration: 0.25,
          ease: "power3.in"
        }, "<")

        .to(".nav-panel", {
          y: "110vh",
          rotation: (index) => (index === 0 ? -16 : 18),
          duration: 0.75,
          ease: "power3.in",
          stagger: {
            from: "end",
            each: 0.08
          }
        }, "<")

        .to(".nav-bg", {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        }, "<0.1")

        .set("#hamburger-nav-overlay", { visibility: "hidden", pointerEvents: "none" });

      timelineRef.current = tl;
    }, menuContainerRef);

    return () => ctx.revert();
  }, []);

  // Trigger GSAP Timeline based on isOpen prop
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;

    if (isOpen) {
      tl.timeScale(1).play(0);
    } else {
      if (tl.time() >= tl.getLabelTime("enterEnd")) {
        tl.timeScale(1.1).play();
      } else {
        tl.timeScale(1.4).reverse();
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

  // Touch & Click Outside listener for Socials Tooltip Pill
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

  const handleNavClick = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      ref={menuContainerRef}
      id="hamburger-nav-overlay"
      className="hamburger-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Overlay"
    >
      {/* Background Overlay */}
      <div className="nav-bg" onClick={onClose} aria-hidden="true" />

      {/* Main Panels Wrapper */}
      <div className="nav-panels-container">
        {/* Floating Close Button */}
        <button
          className="menu-close-floating-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="hamburger-svg">
            <line className="bar bar-top" x1="3" y1="7" x2="17" y2="7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line className="bar bar-bot" x1="3" y1="13" x2="17" y2="13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Panel 1: Primary Navigation Links */}
        <div className="nav-panel nav-panel-primary">
          <div className="panel-header">
            <span className="panel-badge">NAVIGATION</span>
            <span className="panel-brand-wordmark">PAPER HOOF</span>
          </div>

          <nav className="menu-nav-links" aria-label="Main Page Links">
            {navigationLinks.map((link, index) => (
              <button
                key={index}
                className="nav-item"
                onClick={() => handleNavClick(link.path)}
              >
                <span className="nav-item-num">0{index + 1}</span>
                <span className="nav-item-label">{link.label}</span>
                <ArrowRight size={18} className="nav-item-arrow" />
              </button>
            ))}
          </nav>

          <div className="panel-footer-note">
            © {new Date().getFullYear()} Paper Hoof Studio
          </div>
        </div>

        {/* Panel 2: Second Block — Socials, Email & Contact */}
        <div className="nav-panel nav-panel-secondary">
          <div className="panel-header">
            <span className="panel-badge">CONNECT & REACH</span>
          </div>

          <div className="nav-secondary-content">
            {/* Socials Unfurling Tooltip Pill */}
            <div className="menu-section">
              <h3 className="menu-section-title">SOCIAL</h3>
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

            {/* Email Section */}
            <div className="menu-section">
              <h3 className="menu-section-title">EMAIL</h3>
              <a href="mailto:hello@paperhoof.com" className="menu-contact-email">
                <Mail size={16} />
                <span>hello@paperhoof.com</span>
              </a>
            </div>

            {/* Location Section */}
            <div className="menu-section">
              <h3 className="menu-section-title">LOCATION</h3>
              <div className="menu-location-badge">
                <MapPin size={16} />
                <span>Mawanella, Sri Lanka</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="menu-cta-wrapper">
              <button
                type="button"
                className="menu-cta-btn"
                onClick={() => handleNavClick('/brand-review')}
              >
                <span>Book Brand Review</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;