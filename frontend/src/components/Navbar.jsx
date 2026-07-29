import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick, isMenuOpen = false, darkHero = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isBrandReview = location.pathname === '/brand-review';

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 20) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        if (currentY > lastY + 5) {
          setIsVisible(false);
        } else if (currentY < lastY - 5) {
          setIsVisible(true);
        }
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    navigate('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleLogoKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  const handleBrandReviewClick = () => {
    navigate('/brand-review');
  };

  const showNavbar = isVisible || isMenuOpen;

  return (
    <nav
      className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${!showNavbar ? 'navbar-hidden' : ''} ${
        darkHero && !isScrolled ? 'navbar-hero-mode' : ''
      } ${isMenuOpen ? 'navbar-menu-open' : ''}`}
      aria-label="Main navigation"
      data-testid="site-navbar"
    >
      <div className="navbar-content">
        <div className="navbar-left">
          <div
            className="logo-container"
            onClick={handleLogoClick}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Paper Hoof homepage"
          >
            <img
              src={`${process.env.PUBLIC_URL}/paperhoof-wordmark.svg`}
              alt="Paper Hoof"
              className="navbar-logo"
            />
          </div>
        </div>
        <div className="navbar-right">
          {isScrolled && (
            <button
              className="nav-work-btn"
              onClick={() => navigate('/work')}
              data-testid="navbar-work-link"
            >
              Work
            </button>
          )}
          <button
            className={`brand-review-btn ${isBrandReview ? 'active' : ''}`}
            onClick={handleBrandReviewClick}
          >
            Brand Review
          </button>
          <button
            id="menuToggle"
            className="hamburger-btn"
            onClick={onMenuClick}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="nav"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line className="bar bar-top" x1="3" y1="10" x2="17" y2="10" />
              <line className="bar bar-bot" x1="10" y1="3" x2="10" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;