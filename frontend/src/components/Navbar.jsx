import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick, darkHero = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    navigate('/');
    // Scroll to top of homepage
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleBrandReviewClick = () => {
    navigate('/brand-review');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${darkHero && !isScrolled ? 'navbar-hero-mode' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="logo-container" onClick={handleLogoClick}>
            <img
              src={`${process.env.PUBLIC_URL}/paperhoof-logo.svg`}
              alt="Paper Hoof"
              className="navbar-logo"
            />
          </div>
        </div>
        <div className="navbar-right">
          <button className="brand-review-btn" onClick={handleBrandReviewClick}>
            Brand Review
          </button>
          <button className="hamburger-btn" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;