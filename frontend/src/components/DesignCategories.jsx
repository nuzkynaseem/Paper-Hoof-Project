import React, { useEffect, useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { designCategories } from '../mock';
import './DesignCategories.css';

const DesignCategories = ({ isOpen, onClose, scrollPosition }) => {
  const [position, setPosition] = useState({ top: 104, left: 40, fixed: false });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const heroHeight = 583 + 80; // Hero height + navbar height
    const footerElement = document.querySelector('.footer');
    const footerStart = footerElement?.offsetTop || 99999;
    const viewportHeight = window.innerHeight;
    
    // In hero section - absolute positioning
    if (scrollPosition < 100) {
      setPosition({ top: 104, left: 40, fixed: false, inFooter: false });
    }
    // Scrolling through content - fixed to viewport bottom-left
    else if (scrollPosition >= 100 && scrollPosition < footerStart - viewportHeight + 200) {
      setPosition({ bottom: 40, left: 40, fixed: true, inFooter: false });
    }
    // In footer - absolute positioning within footer
    else if (scrollPosition >= footerStart - viewportHeight + 200) {
      const footerOffset = footerStart - scrollPosition;
      setPosition({ 
        top: footerStart + 40, 
        left: 40, 
        fixed: false, 
        inFooter: true 
      });
    }
  }, [scrollPosition]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getPositionStyle = () => {
    if (position.fixed) {
      return {
        position: 'fixed',
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
        top: 'auto'
      };
    } else {
      return {
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        bottom: 'auto'
      };
    }
  };

  return (
    <>
      <div
        className="design-categories-trigger !rounded-lg"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        onClick={handleClick}>

        <span>We Design</span>
        <span className="bullet">•</span>
        <span>Everything</span>
        <span className="arrow">{isExpanded ? '↑' : '↓'}</span>
      </div>

      {isExpanded &&
      <div className="design-categories-overlay">
          <div className="categories-panel">
            <button className="close-btn" onClick={() => setIsExpanded(false)}>
              <X size={24} />
            </button>
            <div className="categories-grid">
              {designCategories.map((category, index) =>
            <button key={index} className="category-chip">
                  {category}
                  <span className="plus">+</span>
                </button>
            )}
            </div>
          </div>
        </div>
      }
    </>);

};

export default DesignCategories;