import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick, darkHero = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

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
          // Scrolling down -> hide
          setIsVisible(false);
        } else if (currentY < lastY - 5) {
          // Scrolling up -> show
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

  const handleBrandReviewClick = () => {
    navigate('/brand-review');
  };

  return (
    <nav
      className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${!isVisible ? 'navbar-hidden' : ''} ${
        darkHero && !isScrolled ? 'navbar-hero-mode' : ''
      }`}
      data-testid="site-navbar"
    >
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="logo-container" onClick={handleLogoClick}>
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
          <button className="brand-review-btn" onClick={handleBrandReviewClick}>
            Brand Review
          </button>
          <button className="hamburger-btn" onClick={onMenuClick} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;