import React, { useEffect, useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { designCategories, projects } from '../mock';
import './DesignCategories.css';

const DesignCategories = ({ scrollPosition }) => {
  const [position, setPosition] = useState('hero');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [dynamicTop, setDynamicTop] = useState(40);

  useEffect(() => {
    const heroSection = document.querySelector('.hero-section');
    const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 700;
    const footer = document.querySelector('.footer');
    const footerTop = footer?.offsetTop || 99999;
    const viewportHeight = window.innerHeight;
    
    // Calculate position based on scroll
    if (scrollPosition < 100) {
      setPosition('hero');
      setDynamicTop(40);
    } else if (scrollPosition >= 100 && scrollPosition < footerTop - viewportHeight) {
      setPosition('viewport');
      // Move down with scroll, but slower than scroll speed
      const scrollProgress = (scrollPosition - 100) / (footerTop - viewportHeight - 100);
      const targetBottom = 40;
      setDynamicTop(40 + (scrollProgress * (viewportHeight - 90)));
    } else if (scrollPosition >= footerTop - viewportHeight) {
      setPosition('footer');
      setDynamicTop(footerTop);
    }
  }, [scrollPosition]);

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setHoveredCategory(null);
  };

  const getProjectForCategory = (category) => {
    const matchingProject = projects.find(p => 
      p.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
    );
    return matchingProject || projects[0];
  };

  return (
    <>
      {!isExpanded ? (
        <div 
          className={`design-categories-trigger !rounded-lg position-${position}`}
          style={position === 'viewport' ? { top: `${dynamicTop}px` } : position === 'footer' ? { top: `${dynamicTop}px` } : {}}
          onClick={handleClick}
        >
          <span>We Design</span>
          <span className="bullet">•</span>
          <span>Everything</span>
          <ChevronUp className="arrow-icon" size={20} />
        </div>
      ) : (
        <div className="design-categories-overlay" onClick={handleClose}>
          <div 
            className={`categories-panel-expanded position-${position}`}
            style={position === 'viewport' ? { top: `${dynamicTop}px` } : position === 'footer' ? { top: `${dynamicTop}px` } : {}}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn-expanded" onClick={handleClose}>
              <X size={20} />
            </button>
            
            <div className="expanded-header">
              <span>We Design</span>
              <span className="bullet">•</span>
              <span>Everything</span>
            </div>
            
            <div className="expanded-content">
              <div className="categories-list">
                {designCategories.map((category, index) => (
                  <button 
                    key={index} 
                    className={`category-item ${hoveredCategory === category ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {category}
                    <span className="plus">+</span>
                  </button>
                ))}
              </div>
              
              {hoveredCategory && (
                <div className="showreel-preview">
                  <img 
                    src={getProjectForCategory(hoveredCategory).image} 
                    alt={hoveredCategory}
                    className="showreel-image"
                  />
                  <div className="showreel-overlay">
                    <span className="showreel-label">{hoveredCategory}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignCategories;