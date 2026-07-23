import React, { useEffect, useRef, useState } from 'react';
import './IntroReveal.css';

const TEXT =
  "We are here to design for you, that's what makes us distinctive, since we started to work we loved everyone who came across us";

const IntroReveal = () => {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const words = TEXT.split(' ');

  useEffect(() => {
    let raf = null;
    const compute = () => {
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        setProgress(total > 0 ? scrolled / total : 0);
      }
      raf = null;
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Reveal words progressively as the user scrolls through the section
  const active = progress * (words.length + 3);

  return (
    <section className="intro-reveal" ref={sectionRef} data-testid="intro-reveal">
      <div className="intro-reveal-sticky">
        <p className="intro-reveal-text">
          {words.map((word, i) => {
            const opacity = Math.min(1, Math.max(0.12, active - i));
            return (
              <span key={i} className="intro-word" style={{ opacity }}>
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
