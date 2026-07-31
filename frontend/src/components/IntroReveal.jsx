import React, { useEffect, useRef, useState } from 'react';
import './IntroReveal.css';
import { API_BASE } from '../utils/api';

const DEFAULT_TEXT =
  "We are here to design for you, that's what makes us distinctive. Since we started to work, we loved everyone who came across us.";

const IntroReveal = () => {
  const textRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statementText, setStatementText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const res = await fetch(`${API_BASE}/site/homepage`);
      if (res.ok) {
        const data = await res.json();
        if (data.secondSectionTitle || data.secondSectionDescription) {
          const combined = [data.secondSectionTitle, data.secondSectionDescription]
            .filter(Boolean)
            .join(" ");
          setStatementText(combined);
        }
      }
    } catch (e) {
      console.warn("Using default intro text");
    }
  };

  const words = statementText.split(' ');

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
        <p className="intro-reveal-statement" ref={textRef}>
          {words.map((word, i) => {
            const wordOpacity = Math.min(1, Math.max(0.18, activeIndex - i));
            const isRevealed = wordOpacity > 0.8;
            return (
              <span
                key={i}
                className={`intro-word ${isRevealed ? 'is-revealed' : ''}`}
                style={{ opacity: wordOpacity }}
              >
                {word}{' '}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
};

export default IntroReveal;
