import React, { useState, useEffect, useRef } from 'react';
import ScrollIndicator from './ScrollIndicator';
import { getMediaUrl } from '../utils/api';
import { getHomepage } from '../utils/siteData';
import './Hero.css';

const DEFAULT_HERO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-white-sand-under-water-4330-large.mp4";

const MOBILE_QUERY = '(max-width: 768px)';

const Hero = () => {
  const [heroContent, setHeroContent] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Phones get the 9:16 hero variant when the admin has uploaded one.
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  const videoRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobileViewport(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', sync);
    else mq.addListener(sync); // Safari < 14
    // Some webviews and emulated viewports re-evaluate matchMedia without ever
    // dispatching its change event — resize is the belt to that suspender.
    window.addEventListener('resize', sync);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', sync);
      else mq.removeListener(sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    getHomepage({ onUpdate: (data) => mounted && setHeroContent(data) })
      .then((data) => mounted && setHeroContent(data || {}))
      .catch(() => mounted && setLoadFailed(true));
    return () => {
      mounted = false;
    };
  }, []);

  // While the homepage settings load, render a skeleton rather than eagerly
  // streaming the external fallback video that would then be swapped out.
  const isLoading = heroContent === null && !loadFailed;
  // Mobile variant wins on phones; an empty mobile field falls back to desktop.
  const rawVideoUrl =
    (isMobileViewport && heroContent?.heroVideoUrlMobile) ||
    heroContent?.heroVideoUrl ||
    DEFAULT_HERO_VIDEO;
  const videoUrl = isLoading ? "" : getMediaUrl(rawVideoUrl);

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
      {isLoading ? (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="ph-skeleton w-full h-full" style={{ borderRadius: 0 }} />
        </div>
      ) : videoUrl ? (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            key={videoUrl}
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
