import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './ui/carousel';
import './MacDockNavigation.css';

/* ─────────────────────────────────────────────────────────────────
   DESKTOP: classic macOS magnification dock
───────────────────────────────────────────────────────────────── */
const DesktopDock = ({ projects, activeSlug, onSelect }) => {
  const dockRef = useRef(null);
  const iconRefs = useRef([]);
  const [hoveredProject, setHoveredProject] = useState(null);

  useEffect(() => {
    const dock = dockRef.current;
    const icons = iconRefs.current.filter(Boolean);
    if (!dock || icons.length === 0) return;

    const min = 52;
    const max = 120;
    const bound = min * Math.PI;

    gsap.set(icons, { transformOrigin: '50% 120%', height: min });
    gsap.set(dock, { position: 'relative', height: 76 });

    const handleMouseMove = (e) => {
      const firstIcon = icons[0];
      const firstLeft = firstIcon ? firstIcon.offsetLeft : 0;
      const offset = dock.getBoundingClientRect().left + firstLeft;
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

    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      dock.removeEventListener('mousemove', handleMouseMove);
      dock.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [projects]);

  return (
    <div className="mac-dock-outer-wrapper">
      {/* Hover tooltip */}
      <div className={`mac-dock-tooltip ${hoveredProject ? 'visible' : ''}`}>
        {hoveredProject && <span>{hoveredProject.name}</span>}
      </div>

      <div className="mac-dock-track">
        <div className="toolbar" ref={dockRef}>
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
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MOBILE: Embla carousel (shadcn Carousel), 2 items visible + peek
───────────────────────────────────────────────────────────────── */
const MobileDock = ({ projects, activeSlug, onSelect }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <div className="mobile-dock-wrapper">
      <Carousel
        opts={{ align: 'start', loop: false, dragFree: true }}
        className="mobile-dock-carousel"
      >
        <CarouselContent className="mobile-dock-content">
          {projects.map((p) => {
            const isActive = p.slug === activeSlug;
            return (
              <CarouselItem key={p.slug || p.id} className="mobile-dock-item">
                <button
                  type="button"
                  className={`mobile-dock-icon-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(p);
                    setActiveTooltip(p.slug);
                    setTimeout(() => setActiveTooltip(null), 1400);
                  }}
                  aria-label={`View ${p.name}`}
                >
                  {/* Tooltip name above icon */}
                  <span
                    className={`mobile-dock-icon-label ${
                      isActive || activeTooltip === p.slug ? 'visible' : ''
                    }`}
                  >
                    {p.name}
                  </span>

                  <div className="dock-icon-img-wrapper">
                    <img src={p.image} alt={p.name} className="dock-icon-img" />
                  </div>

                  {isActive && <span className="dock-active-dot" />}
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Prev / Next arrows positioned outside the carousel overflow clip */}
        <CarouselPrevious className="mobile-dock-prev" />
        <CarouselNext className="mobile-dock-next" />
      </Carousel>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ROOT: shows Desktop or Mobile based on viewport width
───────────────────────────────────────────────────────────────── */
const MacDockNavigation = ({ projects, activeSlug, onSelect }) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section className="mac-dock-section" aria-label="Project Navigation Dock">
      {isMobile ? (
        <MobileDock
          projects={projects}
          activeSlug={activeSlug}
          onSelect={onSelect}
        />
      ) : (
        <DesktopDock
          projects={projects}
          activeSlug={activeSlug}
          onSelect={onSelect}
        />
      )}
    </section>
  );
};

export default MacDockNavigation;
