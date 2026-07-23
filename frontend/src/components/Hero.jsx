import React, { useState, useEffect } from 'react';
import { showreelSlides } from '../mock';
import ScrollIndicator from './ScrollIndicator';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showreelSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section" data-testid="hero-section">
      <div className="hero-inner">
        <div className="hero-content" data-testid="hero-content">
          {showreelSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="hero-bottom">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
};

export default Hero;
