import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Instagram, Music, MessageCircle, Linkedin, Share2, ArrowUpRight, ArrowRight, X } from 'lucide-react';
import { navigationLinks } from '../mock';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const socialsRef = useRef(null);

  const overlayRef = useRef(null);
  const tlRef = useRef(null);
  const enterEndTimeRef = useRef(0);
  const isClosingRef = useRef(false);

  // Initialize GSAP Animation Timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set("#nav-overlay", { visibility: "hidden", pointerEvents: "none" });
      gsap.set(".nav-bg", { opacity: 0 });
      gsap.set(".nav-login", { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          if (isClosingRef.current) {
            isClosingRef.current = false;
            gsap.set("#nav-overlay", { visibility: "hidden", pointerEvents: "none" });
            onClose();
          }
        }
      });

      tl
        .set("#nav-overlay", { visibility: "visible", pointerEvents: "auto" })

        // ═══ ENTER ANIMATION ═══
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
            ease: "back.out(1.2)",
            stagger: 0.1
          },
          0
        )

        .fromTo(".nav-item",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.04
          },
          0.1
        )

        .fromTo(".bar-top",
          { stroke: "var(--horse-black)", attr: { x1: 3, y1: 7, x2: 17, y2: 7 } },
          { stroke: "#0e100f", attr: { x1: 5, y1: 5, x2: 15, y2: 15 }, duration: 0.35, ease: "back.out(1.4)" },
          0.06
        )

        .fromTo(".bar-bot",
          { stroke: "var(--horse-black)", attr: { x1: 3, y1: 13, x2: 17, y2: 13 } },
          { stroke: "#0e100f", attr: { x1: 15, y1: 5, x2: 5, y2: 15 }, duration: 0.35, ease: "back.out(1.4)" },
          0.06
        )

        .to(".nav-login", {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out"
        }, 0.4)

        // ═══ PAUSE AT FULL OPEN STATE ═══
        .addPause();

      enterEndTimeRef.current = tl.duration();

      // ═══ EXIT ANIMATION — Panels fall down with stagger & random rotation ═══
      tl
        .to(".bar", { stroke: "var(--horse-black)", duration: 0.2 })
        .to(".bar-top", { attr: { x1: 3, y1: 7, x2: 17, y2: 7 }, duration: 0.2, ease: "power3.in" }, "<")
        .to(".bar-bot", { attr: { x1: 3, y1: 13, x2: 17, y2: 13 }, duration: 0.2, ease: "power3.in" }, "<")

        .to(".nav-panel", {
          y: "110vh",
          rotation: () => gsap.utils.random(-25, 25),
          duration: 0.85,
          ease: "power3.in",
          stagger: {
            from: "end",
            each: 0.03
          }
        }, "<")

        .to(".nav-bg", {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        }, "<0.1");

      tlRef.current = tl;
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  // Handle open / close transitions
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (isOpen) {
      isClosingRef.current = false;
      if (tl.time() >= enterEndTimeRef.current) {
        tl.timeScale(1).restart();
      } else {
        tl.timeScale(1).play();
      }
    } else {
      if (tl.time() > 0 && !isClosingRef.current) {
        isClosingRef.current = true;
        if (tl.time() < enterEndTimeRef.current) {
          tl.timeScale(1.5).reverse();
        } else {
          tl.timeScale(1).play();
        }
      }
    }
  }, [isOpen]);

  // Touch & Click Outside listener for Mobile/Desktop Tooltip
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

  const handleCloseTrigger = () => {
    const tl = tlRef.current;
    if (tl && isOpen) {
      isClosingRef.current = true;
      if (tl.time() < enterEndTimeRef.current) {
        tl.timeScale(1.5).reverse();
      } else {
        tl.timeScale(1).play();
      }
    } else {
      onClose();
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    handleCloseTrigger();
  };

  return (
    <div
      ref={overlayRef}
      id="nav-overlay"
      className="hamburger-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Background Overlay */}
      <div className="nav-bg" onClick={handleCloseTrigger} />

      {/* Panels Wrapper */}
      <div className="nav-panels-container">
        {/* PANEL 1: Main Navigation Block */}
        <div className="nav-panel nav-panel-primary">
          <div className="panel-header">
            <span className="panel-badge">NAVIGATION</span>
            <button
              type="button"
              className="panel-close-btn"
              onClick={handleCloseTrigger}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="menu-nav">
            {navigationLinks.map((link, index) => (
              <button
                key={index}
                className="nav-item menu-nav-item"
                onClick={() => handleNavClick(link.path)}
              >
                <span className="nav-item-num">0{index + 1}</span>
                <span className="nav-item-label">{link.label}</span>
                <ArrowRight size={22} className="nav-item-arrow" />
              </button>
            ))}
          </nav>
        </div>

        {/* PANEL 2: Secondary Block (Socials, Contact & CTA) */}
        <div className="nav-panel nav-panel-secondary nav-login">
          <div className="panel-header">
            <span className="panel-badge">CONNECT & TALK</span>
          </div>

          <div className="secondary-block-content">
            {/* Social Links Pill */}
            <div className="nav-section">
              <h4 className="nav-section-title">SOCIALS</h4>
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
                >
                  <Share2 size={16} />
                  <span>Social Links</span>
                  <span className="pill-badge-count">4</span>
                </button>

                {/* Unfurling Tooltip Container */}
                <div className={`socials-tooltip-container ${isSocialsOpen ? 'unfurled' : ''}`}>
                  <div className="tooltip-header">
                    <span>CONNECT WITH US</span>
                  </div>
                  <div className="tooltip-links">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="tooltip-link-item">
                      <Instagram size={18} />
                      <span>Instagram</span>
                      <ArrowUpRight size={14} className="link-arrow" />
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="tooltip-link-item">
                      <Music size={18} />
                      <span>TikTok</span>
                      <ArrowUpRight size={14} className="link-arrow" />
                    </a>
                    <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="tooltip-link-item">
                      <MessageCircle size={18} />
                      <span>WhatsApp</span>
                      <ArrowUpRight size={14} className="link-arrow" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="tooltip-link-item">
                      <Linkedin size={18} />
                      <span>LinkedIn</span>
                      <ArrowUpRight size={14} className="link-arrow" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Contact */}
            <div className="nav-section">
              <h4 className="nav-section-title">EMAIL</h4>
              <a href="mailto:hello@paperhoof.com" className="menu-email-link">
                hello@paperhoof.com
              </a>
            </div>

            {/* Location */}
            <div className="nav-section">
              <h4 className="nav-section-title">LOCATION</h4>
              <p className="menu-location-text">Mawanella, Sri Lanka</p>
            </div>

            {/* Direct CTA Button */}
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
  );
};

export default HamburgerMenu;