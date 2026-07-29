import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const auraRef = useRef(null);

  const [hoverState, setHoverState] = useState('default'); // 'default' | 'button' | 'project'
  const [cursorText, setCursorText] = useState('SEE PROJECT • SEE PROJECT • ');
  const [isVisible, setIsVisible] = useState(false);

  // GSAP quickTo refs for ultra-smooth fluid movement
  const dotX = useRef(null);
  const dotY = useRef(null);
  const auraX = useRef(null);
  const auraY = useRef(null);

  useEffect(() => {
    // Check if touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    setIsVisible(true);

    if (dotRef.current && auraRef.current) {
      dotX.current = gsap.quickTo(dotRef.current, 'x', { duration: 0.1, ease: 'power2.out' });
      dotY.current = gsap.quickTo(dotRef.current, 'y', { duration: 0.1, ease: 'power2.out' });

      auraX.current = gsap.quickTo(auraRef.current, 'x', { duration: 0.32, ease: 'power3.out' });
      auraY.current = gsap.quickTo(auraRef.current, 'y', { duration: 0.32, ease: 'power3.out' });
    }

    const handleMouseMove = (e) => {
      if (dotX.current && dotY.current && auraX.current && auraY.current) {
        dotX.current(e.clientX);
        dotY.current(e.clientY);
        auraX.current(e.clientX);
        auraY.current(e.clientY);
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor], [data-cursor-text], .tilt-card, .featured-scroll-card, .work-card, .sub-field-card, .project-case-study-hero, a, button');

      if (!target) {
        setHoverState('default');
        return;
      }

      const cursorType = target.getAttribute('data-cursor');
      const customText = target.getAttribute('data-cursor-text');

      if (cursorType === 'project' || customText || target.closest('.tilt-card, .featured-scroll-card, .work-card, .sub-field-card, .project-case-study-hero')) {
        setHoverState('project');
        if (customText) {
          const upper = customText.trim().toUpperCase();
          setCursorText(`${upper} • ${upper} • `);
        } else {
          // Extract title if present
          const titleEl = target.querySelector('.tilt-title, .featured-side-title, .work-title, h3, h2');
          const titleText = titleEl ? titleEl.textContent.trim().toUpperCase() : 'SEE PROJECT';
          setCursorText(`SEE ${titleText} • SEE ${titleText} • `);
        }
      } else if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        setHoverState('button');
      } else {
        setHoverState('default');
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`custom-cursor-wrapper ${hoverState}`}>
      {/* Central Solid Focal Dot (Image 1) */}
      <div ref={dotRef} className="cursor-dot" />

      {/* Outer Fluid Aura & Circular Text Ring Container (Image 2) */}
      <div ref={auraRef} className="cursor-aura">
        {/* Rotating Circular SVG Text Ring */}
        <div className="cursor-text-ring">
          <svg viewBox="0 0 140 140" className="cursor-text-svg">
            <path
              id="cursorCirclePath"
              d="M 70, 70 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
              fill="none"
            />
            <text className="cursor-text-path">
              <textPath href="#cursorCirclePath" startOffset="0%">
                {cursorText}
              </textPath>
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
