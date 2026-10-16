import React, { useState, useEffect, useRef } from 'react';
import ScrollIndicator from './ScrollIndicator';
import { getMediaUrl } from '../utils/api';
import { getHomepage } from '../utils/siteData';
import './Hero.css';

const DEFAULT_HERO_VIDEO = "https://pub-890f739345cb4bd69d2c9be93e242605.r2.dev/uploads/9dc9ebb3-3661-4d4b-b636-dde08a70de57.mp4";
const DEFAULT_HERO_VIDEO_MOBILE = "https://pub-890f739345cb4bd69d2c9be93e242605.r2.dev/uploads/hero-mobile-9dc9ebb3.mp4";

const MOBILE_QUERY = '(max-width: 768px)';

const Hero = () => {
  const [heroContent, setHeroContent] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Phones get the 9:16 mobile variant when available or default.
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  const videoRef = useRef(null);

  const notifyHeroReady = () => {
    if (typeof window !== 'undefined' && !window.__PH_HERO_READY__) {
      window.__PH_HERO_READY__ = true;
      window.dispatchEvent(new CustomEvent('ph-hero-ready'));
    }
  };

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobileViewport(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', sync);
    else mq.addListener(sync); // Safari < 14
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
      .catch(() => {
        if (mounted) {
          setLoadFailed(true);
          notifyHeroReady();
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Mobile variant wins on phones; an empty mobile field falls back to mobile default.
  const rawVideoUrl =
    (isMobileViewport && (heroContent?.heroVideoUrlMobile || DEFAULT_HERO_VIDEO_MOBILE)) ||
    heroContent?.heroVideoUrl ||
    DEFAULT_HERO_VIDEO;
  const videoUrl = getMediaUrl(rawVideoUrl);

  // Bulletproof video playback lifecycle: auto-resume on mobile screen unlock,
  // tab switch, app resume, pageshow (bfcache), and window focus.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      const v = videoRef.current;
      if (!v) return;

      // Ensure muted properties and attributes are strictly set for mobile autoPlay policies
      v.defaultMuted = true;
      v.muted = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', 'true');

      const promise = v.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            // Wait for an actual decoded frame to be rendered before signaling ready
            if ('requestVideoFrameCallback' in v) {
              v.requestVideoFrameCallback(() => {
                notifyHeroReady();
              });
            } else {
              notifyHeroReady();
            }
          })
          .catch((err) => {
            // Autoplay policy deferred until user interaction
          });
      }
    };

    // Initial attempt
    playVideo();

    // Check if already actively playing past first frame
    if (video.currentTime > 0.05 || (!video.paused && video.readyState >= 3)) {
      notifyHeroReady();
    }

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

    // 5. First touch/scroll fallback on mobile in case browser paused audio/video engine
    const handleUserInteraction = () => {
      const v = videoRef.current;
      if (v && v.paused) {
        playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    video.addEventListener('pause', handlePause);
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('touchend', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true, once: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      video.removeEventListener('pause', handlePause);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchend', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, [videoUrl]);

  return (
    <section className="hero-section relative overflow-hidden" data-testid="hero-section">
      {videoUrl ? (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#0d1a14]">
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
            onPlaying={() => {
              const v = videoRef.current;
              if (v && 'requestVideoFrameCallback' in v) {
                v.requestVideoFrameCallback(() => notifyHeroReady());
              } else {
                notifyHeroReady();
              }
            }}
            onTimeUpdate={(e) => {
              if (e.target.currentTime > 0.05) {
                notifyHeroReady();
              }
            }}
            onLoadedData={() => {
              const v = videoRef.current;
              if (v && v.paused) {
                v.play().catch(() => {});
              }
            }}
            onError={notifyHeroReady}
            className="w-full h-full object-cover"
          />
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
