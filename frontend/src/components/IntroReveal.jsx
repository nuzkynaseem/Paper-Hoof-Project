import React, { useEffect, useRef, useState } from 'react';
import './IntroReveal.css';
import { getHomepage } from '../utils/siteData';

const DEFAULT_TEXT =
  "We are here to design for you, that's what makes us distinctive. Since we started to work, we loved everyone who came across us.";

const IntroReveal = () => {
  const textRef = useRef(null);
  const [progress, setProgress] = useState(0);
  // null = still loading -> skeleton. The default copy is only a failure fallback;
  // painting it first meant the text visibly swapped once the API answered.
  const [statementText, setStatementText] = useState(null);

  useEffect(() => {
    let mounted = true;
    getHomepage({ onUpdate: (data) => mounted && applyText(data) })
      .then((data) => mounted && applyText(data))
      .catch(() => mounted && setStatementText(DEFAULT_TEXT));
    return () => {
      mounted = false;
    };
  }, []);

  const applyText = (data) => {
    setStatementText(
      (data && (data.secondSectionDescription || data.secondSectionTitle)) || DEFAULT_TEXT
    );
  };

  const words = (statementText || '').split(' ');

  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      const el = textRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight * 0.85;
      const end = windowHeight * 0.25;

      const current = rect.top;
      const total = start - end;
      const rawProgress = (start - current) / total;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);

      setProgress(clampedProgress);
      rafId = null;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [statementText]);

  const activeIndex = progress * (words.length + 1);

  return (
    <section className="intro-reveal-section" data-testid="intro-reveal">
      <div className="intro-container">
        {statementText === null ? (
          <div className="intro-reveal-statement" aria-hidden="true">
            <span className="ph-skeleton ph-skeleton-line" style={{ display: 'block', width: '92%', height: '1.1em', marginBottom: '0.5em' }} />
            <span className="ph-skeleton ph-skeleton-line" style={{ display: 'block', width: '78%', height: '1.1em', marginBottom: '0.5em' }} />
            <span className="ph-skeleton ph-skeleton-line" style={{ display: 'block', width: '55%', height: '1.1em' }} />
          </div>
        ) : (
        <p className="intro-reveal-statement" ref={textRef}>
          {words.map((word, i) => {
            const wordOpacity = Math.min(1, Math.max(0.15, activeIndex - i));
            return (
              <span
                key={i}
                className="intro-word"
                style={{ opacity: wordOpacity }}
              >
                {word}{' '}
              </span>
            );
          })}
        </p>
        )}
      </div>
    </section>
  );
};

export default IntroReveal;
