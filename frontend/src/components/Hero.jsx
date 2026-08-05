import React, { useState, useEffect, useRef } from 'react';
import ScrollIndicator from './ScrollIndicator';
import { API_BASE, getMediaUrl } from '../utils/api';
import './Hero.css';

const DEFAULT_HERO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-white-sand-under-water-4330-large.mp4";

const Hero = () => {
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

  const rawVideoUrl = heroContent?.heroVideoUrl || DEFAULT_HERO_VIDEO;
  const videoUrl = getMediaUrl(rawVideoUrl);

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
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#123524]/60 via-transparent to-black/20 pointer-events-none" />
        </div>
      ) : null}

      <div className="hero-inner relative z-10 flex flex-col justify-end items-center pb-8">
        <div className="hero-bottom">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
};

export default Hero;
