import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { designCategories } from '../mock';
import './DesignCategories.css';

const DesignCategories = ({ scrollPosition }) => {
  const [position, setPosition] = useState('hero');
  const [isExpanded, setIsExpanded] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);

  useEffect(() => {
    const heroSection = document.querySelector('.hero-section');
    const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 700;
    const footer = document.querySelector('.footer');
    const footerTop = footer?.offsetTop || 99999;
    const viewportHeight = window.innerHeight;
    
    // Determine position based on scroll
    if (scrollPosition < heroBottom - 200) {
      setPosition('hero');
      setFooterOffset(0);
    } else if (scrollPosition >= footerTop - viewportHeight + 100) {
      setPosition('footer');
      // Calculate absolute position within footer
      setFooterOffset(footerTop + 40);
    } else {
      setPosition('viewport');
      setFooterOffset(0);
    }
  }, [scrollPosition]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getInlineStyle = () => {
    if (position === 'footer') {
      return {
        top: `${footerOffset}px`
      };
    }
    return {};
  };

  return (
    <>
      <div 
        className={`design-categories-trigger !rounded-lg position-${position} ${isExpanded ? 'expanded' : ''}`}
        style={getInlineStyle()}
        onClick={handleClick}
      >
        <span>We Design</span>
        <span className="bullet">•</span>
        <span>Everything</span>
        <ChevronUp className={`arrow-icon ${isExpanded ? 'rotated' : ''}`} size={20} />
      </div>

      {isExpanded && (
        <div className="design-categories-overlay" onClick={() => setIsExpanded(false)}>
          <div 
            className={`categories-panel ${position === 'footer' ? 'from-footer' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={() => setIsExpanded(false)}>
              <X size={24} />
            </button>
            <h3 className="panel-title">What We Design</h3>
            <div className="categories-grid">
              {designCategories.map((category, index) => (
                <button key={index} className="category-chip">
                  {category}
                  <span className="plus">+</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignCategories;