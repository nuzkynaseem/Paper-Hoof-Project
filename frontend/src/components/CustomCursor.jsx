import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const auraRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const auraPos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);

  const [hoverState, setHoverState] = useState('default'); // 'default' | 'button' | 'project'
  const [cursorText, setCursorText] = useState('SEE PROJECT • SEE PROJECT • ');
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Check if touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor], [data-cursor-text], .tilt-card, .featured-scroll-card, .work-card, .sub-field-card, .project-case-study-hero, .gravity-canvas-container, a, button');

      if (!target) {
        setHoverState('default');
        return;
      }

      const cursorType = target.getAttribute('data-cursor');
      const customText = target.getAttribute('data-cursor-text');

      if (cursorType === 'project' || customText || target.closest('.tilt-card, .featured-scroll-card, .work-card, .sub-field-card, .project-case-study-hero, .gravity-canvas-container')) {
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

    const handleMouseDown = (e) => {
      const isCanvas = e.target.closest('.gravity-canvas-container, canvas');
      if (isCanvas) {
        setIsDragging(true);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
      setIsDragging(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    // High-performance 120fps LERP Animation Loop
    const loop = () => {
      // Lerp Dot (fast & precise)
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.45;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.45;

      // Lerp Aura (silky smooth trailing)
      auraPos.current.x += (mousePos.current.x - auraPos.current.x) * 0.16;
      auraPos.current.y += (mousePos.current.y - auraPos.current.y) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${auraPos.current.x}px, ${auraPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  return (
    <div className={`custom-cursor-wrapper ${hoverState} ${isVisible && !isDragging ? 'active' : ''}`}>
      {/* Central Solid Focal Dot (Image 1) */}
      <div ref={dotRef} className="cursor-dot" />

      {/* Outer Fluid Aura & Compact Circular Text Ring Container (Image 2) */}
      <div ref={auraRef} className="cursor-aura">
        {/* Rotating Circular SVG Text Ring */}
        <div className="cursor-text-ring">
          <svg viewBox="0 0 140 140" className="cursor-text-svg">
            <path
              id="cursorCirclePath"
              d="M 70, 70 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
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
