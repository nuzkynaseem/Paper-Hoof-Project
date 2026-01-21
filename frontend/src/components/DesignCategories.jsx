import React, { useEffect, useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { designCategories, projects } from '../mock';
import './DesignCategories.css';

const DesignCategories = ({ scrollPosition, isHomePage = false }) => {
  const [position, setPosition] = useState('hero');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedFrom, setExpandedFrom] = useState('hero'); // Track where expansion was triggered from

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isHomePage) return; // Only animate on homepage
    
    const footer = document.querySelector('.footer');
    const footerTop = footer?.offsetTop || 99999;
    const viewportHeight = window.innerHeight;
    const scrollThreshold = footerTop - viewportHeight + 100; // Start docking animation 100px before footer visible
    
    // Determine position based on scroll
    if (scrollPosition < 50) {
      setPosition('hero'); // Initial position at top
    } else if (scrollPosition >= scrollThreshold) {
      setPosition('docked'); // Docked in footer
    } else {
      setPosition('floating'); // Floating with viewport
    }
  }, [scrollPosition, isHomePage]);

  const handleClick = () => {
    setExpandedFrom(position); // Remember where we expanded from
    setIsExpanded(!isExpanded);
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

  // On non-home pages or when docked, always show in footer position
  const showInFooter = !isHomePage || position === 'footer';

  if (isExpanded) {
    return (
      <div className="design-categories-overlay" onClick={handleClose}>
        <div 
          className={`categories-panel-expanded-new ${showInFooter ? 'from-footer' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn-expanded" onClick={handleClose}>
            <X size={20} />
          </button>
          
          <div className="expanded-layout">
            <div className="expanded-left">
              <div className="expanded-header">
                <span>We Design</span>
                <span className="bullet">•</span>
                <span>Everything</span>
              </div>
              
              <div className="categories-list-vertical">
                {designCategories.map((category, index) => (
                  <button 
                    key={index} 
                    className={`category-item-vertical ${hoveredCategory === category ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <span className="category-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="category-name">{category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="expanded-right">
              {hoveredCategory ? (
                <div className="showreel-preview-large">
                  <img 
                    src={getProjectForCategory(hoveredCategory).image} 
                    alt={hoveredCategory}
                    className="showreel-image-large"
                  />
                  <div className="showreel-overlay-large">
                    <span className="showreel-label-large">{hoveredCategory}</span>
                  </div>
                </div>
              ) : (
                <div className="showreel-placeholder-large">
                  <span>Hover over a category</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render docked rectangle (non-expanded state)
  if (!isHomePage) {
    // On non-home pages, don't render - footer will show it
    return null;
  }

  return (
    <div 
      className={`design-categories-trigger !rounded-lg position-${position}`}
      style={position === 'viewport' ? { top: `${Math.min(scrollPosition, (document.querySelector('.footer')?.offsetTop || 99999) - window.innerHeight + 100)}px` } : {}}
      onClick={handleClick}
    >
      <span>We Design</span>
      <span className="bullet">•</span>
      <span>Everything</span>
      <ChevronUp className="arrow-icon" size={20} />
    </div>
  );
};

export default DesignCategories;