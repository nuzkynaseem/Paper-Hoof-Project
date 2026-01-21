import React, { useEffect, useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { designCategories, projects } from '../mock';
import './DesignCategories.css';

const DesignCategories = ({ scrollPosition, isHomePage = false, isDocked = false }) => {
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
    if (!footer) return;
    
    const footerTop = footer.offsetTop;
    const viewportHeight = window.innerHeight;
    const scrollThreshold = footerTop - viewportHeight + 150; // Start transition 150px before footer visible
    
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

  // Expanded state with layout based on where it was expanded from
  if (isExpanded) {
    const isExpandedFromTop = expandedFrom === 'hero' || expandedFrom === 'floating';
    
    return (
      <div className="design-categories-overlay" onClick={handleClose}>
        <div 
          className={`categories-panel-new ${isExpandedFromTop ? 'expanded-from-top' : 'expanded-from-bottom'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn-new" onClick={handleClose}>
            <X size={20} />
          </button>
          
          {isExpandedFromTop ? (
            // Layout when expanded from hero/floating: Title at top
            <>
              <div className="expanded-title">
                <span>We Design</span>
                <span className="bullet">•</span>
                <span>Everything</span>
              </div>
              
              <div className="categories-grid">
                {designCategories.map((category, index) => (
                  <button 
                    key={index} 
                    className={`category-btn ${hoveredCategory === category ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {category} +
                  </button>
                ))}
              </div>
              
              <div className="preview-container">
                {hoveredCategory ? (
                  <div className="preview-content">
                    <img 
                      src={getProjectForCategory(hoveredCategory).image} 
                      alt={hoveredCategory}
                      className="preview-image"
                    />
                    <div className="preview-overlay">
                      <span className="preview-label">{hoveredCategory}</span>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <span>Hover over a category</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Layout when expanded from footer: Title at bottom
            <>
              <div className="preview-container">
                {hoveredCategory ? (
                  <div className="preview-content">
                    <img 
                      src={getProjectForCategory(hoveredCategory).image} 
                      alt={hoveredCategory}
                      className="preview-image"
                    />
                    <div className="preview-overlay">
                      <span className="preview-label">{hoveredCategory}</span>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <span>Hover over a category</span>
                  </div>
                )}
              </div>
              
              <div className="categories-grid">
                {designCategories.map((category, index) => (
                  <button 
                    key={index} 
                    className={`category-btn ${hoveredCategory === category ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {category} +
                  </button>
                ))}
              </div>
              
              <div className="expanded-title">
                <span>We Design</span>
                <span className="bullet">•</span>
                <span>Everything</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // On non-home pages, don't render - footer will show it
  if (!isHomePage) {
    return null;
  }

  // On homepage, when docked, don't render - footer shows it
  if (isDocked) {
    return null;
  }

  // Calculate the top position for floating state
  const getTopPosition = () => {
    if (position === 'hero') {
      return isMobile ? '20px' : '40px';
    } else if (position === 'floating') {
      // Stick to viewport - always visible while scrolling
      return '40px';
    }
    return 'auto'; // docked state
  };

  return (
    <div 
      className={`design-categories-trigger position-${position} ${isMobile ? 'mobile' : ''}`}
      style={{
        top: position === 'floating' ? '40px' : (position === 'hero' ? (isMobile ? '20px' : '40px') : 'auto'),
        position: position === 'floating' ? 'fixed' : 'absolute'
      }}
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