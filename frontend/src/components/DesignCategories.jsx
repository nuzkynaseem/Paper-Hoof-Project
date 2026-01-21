import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { designCategories } from '../mock';
import './DesignCategories.css';

const DesignCategories = ({ isOpen, onClose, scrollPosition }) => {
  const [position, setPosition] = useState({ top: 80, left: 40 });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const heroHeight = 583 + 120; // Hero height + navbar height
    const footerStart = document.querySelector('.footer')?.offsetTop || 99999;
    const viewportHeight = window.innerHeight;
    
    if (scrollPosition > heroHeight && scrollPosition < footerStart - viewportHeight) {
      const newTop = Math.min(scrollPosition - heroHeight + 80, footerStart - 200);
      setPosition({ top: newTop, left: 40 });
    } else if (scrollPosition >= footerStart - viewportHeight) {
      setPosition({ top: footerStart - 180, left: 40 });
    } else {
      setPosition({ top: 80, left: 40 });
    }
  }, [scrollPosition]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (onClose && !isExpanded) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className={`design-categories-trigger ${isExpanded ? 'expanded' : ''}`}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        onClick={handleClick}
      >
        <span>We Design</span>
        <span className="bullet">•</span>
        <span>Everything</span>
        <span className="arrow">{isExpanded ? '↑' : '↓'}</span>
      </div>

      {isExpanded && (
        <div className="design-categories-overlay">
          <div className="categories-panel">
            <button className="close-btn" onClick={() => setIsExpanded(false)}>
              <X size={24} />
            </button>
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