import React, { useState, useEffect, useRef } from 'react';
import { showreelSlides } from '../mock';
import ScrollIndicator from './ScrollIndicator';
import { API_BASE } from '../utils/api';
import './Hero.css';

const DEFAULT_HERO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-white-sand-under-water-4330-large.mp4";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroContent, setHeroContent] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const res = await fetch(`${API_BASE}/site/homepage`);
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

  const videoUrl = heroContent?.heroVideoUrl || DEFAULT_HERO_VIDEO;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Hero video autoplay deferred:", err);
        });
      }
    }
  }, [videoUrl]);

  return (
    <section className="hero-section relative overflow-hidden" data-testid="hero-section">
      {videoUrl ? (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-75"
          >
            <source src={videoUrl} />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#123524]/80 via-transparent to-black/30 pointer-events-none" />
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
