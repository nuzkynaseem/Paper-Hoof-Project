import React, { useState, useEffect } from 'react';
import { showreelSlides } from '../mock';
import ScrollIndicator from './ScrollIndicator';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroContent, setHeroContent] = useState(null);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const res = await fetch("/api/site/homepage");
      if (res.ok) {
        const data = await res.json();
        setHeroContent(data);
      }
    } catch (e) {
      console.warn("Using fallback hero data");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showreelSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section relative overflow-hidden" data-testid="hero-section">
      {heroContent?.heroVideoUrl ? (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            src={heroContent.heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#123524] via-transparent to-black/40" />
        </div>
      ) : null}

      <div className="hero-inner relative z-10">
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
