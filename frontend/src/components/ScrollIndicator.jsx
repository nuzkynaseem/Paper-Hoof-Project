import React from 'react';
import { ChevronDown } from 'lucide-react';
import './ScrollIndicator.css';

const ScrollIndicator = () => {
  const scrollToProjects = () => {
    const projectsSection = document.getElementById('recent-projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="scroll-indicator" onClick={scrollToProjects}>
      <p className="scroll-text">See Selected Projects</p>
      <div className="scroll-arrow">
        <ChevronDown size={24} />
      </div>
    </div>
  );
};

export default ScrollIndicator;