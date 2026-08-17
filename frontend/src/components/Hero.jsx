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

  // Bulletproof video playback lifecycle: auto-resume on mobile screen unlock,
  // tab switch, app resume, pageshow (bfcache), and window focus.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      const v = videoRef.current;
      if (!v) return;

      // Ensure muted properties are strictly set for mobile autoPlay policies
      v.defaultMuted = true;
      v.muted = true;

      const promise = v.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          // Autoplay policy or deferred
        });
      }
    };

    // Initial attempt
    playVideo();

    // 1. Tab visibility / App unlock
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };

    // 2. iOS Safari / bfcache resume
    const handlePageShow = () => {
      playVideo();
    };

    // 3. Window focus (returning to browser window)
    const handleFocus = () => {
      playVideo();
    };

    // 4. Resume if browser paused video while tab is active
    const handlePause = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(playVideo, 80);
      }
    };

    // 5. First touch fallback on mobile in case browser paused audio/video engine
    const handleUserInteraction = () => {
      playVideo();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    video.addEventListener('pause', handlePause);
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      video.removeEventListener('pause', handlePause);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
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
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
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
