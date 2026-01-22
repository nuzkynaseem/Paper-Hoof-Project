import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
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
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="logo-container" onClick={handleLogoClick}>
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="8" y="12" width="16" height="12" fill="currentColor" />
                <path d="M12 8 L16 4 L20 8" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="18" r="2" fill="var(--bg-cream)" className="logo-eye" />
              </svg>
            </div>
            <span className="logo-text">Branfern</span>
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