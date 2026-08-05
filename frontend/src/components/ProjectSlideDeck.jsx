import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { getMediaUrl } from '../utils/api';
import './ProjectSlideDeck.css';

const ProjectSlideDeck = ({ project }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate a deck of presentation slides for the current project
  const slides = project.images && project.images.length > 0
    ? project.images.map((img, i) => ({
        url: img,
        title: `${project.name} — Deck ${String(i + 1).padStart(2, '0')}`,
        subtitle: project.category
      }))
    : [
        { url: project.image, title: `${project.name} — Brand Identity`, subtitle: project.category },
        { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&h=1000&fit=crop', title: `${project.name} — Brand System & Layout`, subtitle: 'Brand Strategy' },
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=1000&fit=crop', title: `${project.name} — Packaging & Touchpoints`, subtitle: 'Design System' },
        { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&h=1000&fit=crop', title: `${project.name} — Digital Experience`, subtitle: 'Interactive' },
      ];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className={`jkr-slide-deck-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="jkr-slide-viewport">
        <img
          src={getMediaUrl(currentSlide.url)}
          alt={currentSlide.title}
          className="jkr-slide-image"
        />

        {/* Overlay Title & Category Tag */}
        <div className="jkr-slide-overlay">
          <div className="jkr-slide-info">
            <span className="jkr-slide-category">{currentSlide.subtitle}</span>
            <h2 className="jkr-slide-title">{currentSlide.title}</h2>
          </div>
          
          <button
            className="jkr-fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label="Toggle fullscreen presentation"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* Left & Right Navigation Arrows */}
        <button className="jkr-slide-arrow left" onClick={handlePrev} aria-label="Previous Slide">
          <ChevronLeft size={28} />
        </button>
        <button className="jkr-slide-arrow right" onClick={handleNext} aria-label="Next Slide">
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Slide Deck Bottom Control Bar */}
      <div className="jkr-deck-controls">
        <div className="jkr-slide-counter">
          <span className="current-num">{String(currentSlideIndex + 1).padStart(2, '0')}</span>
          <span className="num-divider">/</span>
          <span className="total-num">{String(slides.length).padStart(2, '0')}</span>
        </div>

        <div className="jkr-slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`jkr-dot ${i === currentSlideIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlideIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="jkr-slide-hint">
          <span>{project.name} Presentation Deck</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectSlideDeck;
