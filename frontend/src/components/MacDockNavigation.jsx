import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MacDockNavigation.css';

const MacDockNavigation = ({ projects, activeSlug, onSelect }) => {
  const trackRef = useRef(null);
  const toolbarRef = useRef(null);
  const iconRefs = useRef([]);
  const rafRef = useRef(null);

  const [hoveredProject, setHoveredProject] = useState(null);
  const [centeredProject, setCenteredProject] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrollMode, setIsScrollMode] = useState(false);

  // ── Detect whether we should be in scroll mode ──────────────────────────
  const checkScrollMode = useCallback(() => {
    const track = trackRef.current;
    const toolbar = toolbarRef.current;
    if (!track || !toolbar) return;

    const isMobile = window.innerWidth < 768;
    const overflows = toolbar.scrollWidth > track.clientWidth;
    setIsScrollMode(isMobile || overflows);
  }, []);

  // ── Update left / right chevron visibility ───────────────────────────────
  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // ── Find the icon whose center is closest to the track's center ──────────
  const updateCenteredProject = useCallback(() => {
    const track = trackRef.current;
    const icons = iconRefs.current.filter(Boolean);
    if (!track || icons.length === 0) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closest = null;
    let closestDist = Infinity;

    icons.forEach((icon, i) => {
      const rect = icon.getBoundingClientRect();
      const iconCenter = rect.left + rect.width / 2;
      const dist = Math.abs(iconCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = projects[i];
      }
    });

    setCenteredProject(closest || null);
  }, [projects]);

  // ── Handle scroll event (debounced via rAF) ──────────────────────────────
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      updateScrollState();
      updateCenteredProject();
    });
  }, [updateScrollState, updateCenteredProject]);

  // ── Chevron click handlers ───────────────────────────────────────────────
  const scrollLeft = () => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: -220, behavior: 'smooth' });
  };
  const scrollRight = () => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: 220, behavior: 'smooth' });
  };

  // ── macOS magnification (desktop non-scroll mode only) ──────────────────
  useEffect(() => {
    if (isScrollMode) return; // disable magnification in scroll mode

    const toolbar = toolbarRef.current;
    const icons = iconRefs.current.filter(Boolean);
    if (!toolbar || icons.length === 0) return;

    const min = 52;
    const max = 120;
    const bound = min * Math.PI;

    gsap.set(icons, { transformOrigin: '50% 120%', height: min });

    const handleMouseMove = (e) => {
      const firstIcon = icons[0];
      const firstLeft = firstIcon ? firstIcon.offsetLeft : 0;
      const offset = toolbar.getBoundingClientRect().left + firstLeft;
      const pointer = e.clientX - offset;

      icons.forEach((icon, i) => {
        const distance = i * min + min / 2 - pointer;
        let scale = 1;
        let x = 0;
        if (-bound < distance && distance < bound) {
          const rad = (distance / min) * 0.5;
          scale = 1 + (max / min - 1) * Math.cos(rad);
          x = 2 * (max - min) * Math.sin(rad);
        } else {
          x = (-bound < distance ? 2 : -2) * (max - min);
        }
        gsap.to(icon, { duration: 0.3, x, scale, ease: 'power2.out' });
      });
    };

    const handleMouseLeave = () => {
      setHoveredProject(null);
      gsap.to(icons, { duration: 0.3, scale: 1, x: 0, ease: 'power2.out' });
    };

    toolbar.addEventListener('mousemove', handleMouseMove);
    toolbar.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      toolbar.removeEventListener('mousemove', handleMouseMove);
      toolbar.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isScrollMode, projects]);

  // ── Scroll event listener & resize observer ──────────────────────────────
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    checkScrollMode();
    updateScrollState();
    updateCenteredProject();

    track.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObs = new ResizeObserver(() => {
      checkScrollMode();
      updateScrollState();
      updateCenteredProject();
    });
    resizeObs.observe(track);
    if (toolbarRef.current) resizeObs.observe(toolbarRef.current);

    window.addEventListener('resize', checkScrollMode);

    return () => {
      track.removeEventListener('scroll', handleScroll);
      resizeObs.disconnect();
      window.removeEventListener('resize', checkScrollMode);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [projects, handleScroll, checkScrollMode, updateScrollState, updateCenteredProject]);

  // ── Scroll active item into view when project changes ────────────────────
  useEffect(() => {
    const track = trackRef.current;
    const icons = iconRefs.current.filter(Boolean);
    if (!track || !isScrollMode) return;

    const activeIdx = projects.findIndex((p) => p.slug === activeSlug);
    if (activeIdx < 0) return;
    const activeIcon = icons[activeIdx];
    if (!activeIcon) return;

    const trackRect = track.getBoundingClientRect();
    const iconRect = activeIcon.getBoundingClientRect();
    const scrollTarget =
      track.scrollLeft +
      iconRect.left -
      trackRect.left -
      (trackRect.width / 2 - iconRect.width / 2);
    track.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [activeSlug, projects, isScrollMode]);

  // ── Tooltip text: hover takes priority, then centered ────────────────────
  const visibleTooltip = hoveredProject || (isScrollMode ? centeredProject : null);

  return (
    <section className="mac-dock-section" aria-label="Project Navigation Dock">
      <div className="mac-dock-outer-wrapper">

        {/* ── Tooltip ──────────────────────────────────────────────────── */}
        <div
          className={`mac-dock-tooltip ${visibleTooltip ? 'visible' : ''} ${
            !hoveredProject && centeredProject ? 'centered-mode' : ''
          }`}
        >
          {visibleTooltip && <span>{visibleTooltip.name}</span>}
        </div>

        {/* ── Dock scroll wrapper with chevrons ────────────────────────── */}
        <div className={`dock-scroll-wrapper ${isScrollMode ? 'scroll-mode' : ''}`}>

          {/* Left chevron */}
          <button
            type="button"
            className={`dock-chevron dock-chevron-left ${!canScrollLeft ? 'hidden' : ''}`}
            onClick={scrollLeft}
            aria-label="Scroll dock left"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Scrollable track */}
          <div
            ref={trackRef}
            className={`mac-dock-track ${isScrollMode ? 'scrollable' : ''}`}
          >
            <div className="toolbar" ref={toolbarRef}>
              {projects.map((p, index) => {
                const isActive = p.slug === activeSlug;
                return (
                  <button
                    key={p.slug || p.id}
                    ref={(el) => (iconRefs.current[index] = el)}
                    className={`toolbarItem ${isActive ? 'active' : ''}`}
                    onClick={() => onSelect(p)}
                    onMouseEnter={() => setHoveredProject(p)}
                    onMouseLeave={() => setHoveredProject(null)}
                    aria-label={`View ${p.name}`}
                    title={p.name}
                  >
                    <div className="dock-icon-img-wrapper">
                      <img src={p.image} alt={p.name} className="dock-icon-img" />
                    </div>
                    {isActive && <span className="dock-active-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right chevron */}
          <button
            type="button"
            className={`dock-chevron dock-chevron-right ${!canScrollRight ? 'hidden' : ''}`}
            onClick={scrollRight}
            aria-label="Scroll dock right"
          >
            <ChevronRight size={18} />
          </button>

        </div>
      </div>
    </section>
  );
};

export default MacDockNavigation;
