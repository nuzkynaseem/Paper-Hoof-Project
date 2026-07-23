import React from 'react';
import './ScrollIndicator.css';

const ScrollIndicator = () => {
  const scrollToProjects = () => {
    const projectsSection = document.getElementById('recent-projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      className="scroll-indicator"
      onClick={scrollToProjects}
      aria-label="Scroll to projects"
      data-testid="hero-scroll-arrow"
    >
      <svg className="scroll-arrow-svg" width="26" height="46" viewBox="0 0 26 46" fill="none">
        <line x1="13" y1="2" x2="13" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 27 L13 36 L22 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

export default ScrollIndicator;
