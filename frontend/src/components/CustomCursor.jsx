import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const auraRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const auraPos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);

  const [hoverState, setHoverState] = useState('default'); // 'default' | 'button' | 'project' | 'canvas'
  const [cursorText, setCursorText] = useState('SEE PROJECT');
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

      if (cursorType === 'canvas' || target.closest('.gravity-canvas-container')) {
        setHoverState('canvas');
        setCursorText('PLAY WITH SHAPES');
      } else if (cursorType === 'project' || customText || target.closest('.tilt-card, .featured-scroll-card, .work-card, .sub-field-card, .project-case-study-hero')) {
        setHoverState('project');
        if (customText) {
          setCursorText(customText.trim().toUpperCase());
        } else {
          // Extract title if present
          const titleEl = target.querySelector('.tilt-title, .featured-side-title, .work-title, h3, h2');
          const titleText = titleEl ? titleEl.textContent.trim().toUpperCase() : 'SEE PROJECT';
          setCursorText(`SEE ${titleText}`);
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
      auraPos.current.x += (mousePos.current.x - auraPos.current.x) * 0.18;
      auraPos.current.y += (mousePos.current.y - auraPos.current.y) * 0.18;

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
    <div className={`custom-cursor-wrapper ${hoverState} ${isVisible ? 'active' : ''} ${isDragging ? 'is-dragging' : ''}`}>
      {/* Central Solid Focal Dot */}
      <div ref={dotRef} className="cursor-dot" />

      {/* Outer Fluid Aura / Pill Capsule Tooltip */}
      <div ref={auraRef} className="cursor-aura">
        <div className="cursor-pill-content">
          <span className="cursor-pill-text">{cursorText}</span>
          {hoverState !== 'canvas' && <ArrowUpRight size={14} className="cursor-pill-arrow" />}
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
