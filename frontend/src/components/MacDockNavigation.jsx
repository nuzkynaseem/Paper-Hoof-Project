import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import './MacDockNavigation.css';

const MacDockNavigation = ({ projects, activeSlug, onSelect }) => {
  // Desktop macOS dock state & refs
  const trackRef = useRef(null);
  const toolbarRef = useRef(null);
  const iconRefs = useRef([]);
  const rafRef = useRef(null);

  const [hoveredProject, setHoveredProject] = useState(null);
  const [centeredProject, setCenteredProject] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrollMode, setIsScrollMode] = useState(false);

  // Mobile Carousel API & centered item state
  const [carouselApi, setCarouselApi] = useState(null);
  const [centeredMobileIndex, setCenteredMobileIndex] = useState(0);

  // Sync active project to centered slide when activeSlug changes or carousel mounts
  useEffect(() => {
    if (!carouselApi) return;
    const activeIdx = projects.findIndex((p) => p.slug === activeSlug);
    if (activeIdx >= 0) {
      carouselApi.scrollTo(activeIdx);
      setCenteredMobileIndex(activeIdx);
    }
  }, [carouselApi, activeSlug, projects]);

  // Listen to carousel snap position to track which component is currently in the middle
  useEffect(() => {
    if (!carouselApi) return;

    const onSelectMobile = () => {
      const snapIndex = carouselApi.selectedScrollSnap();
      setCenteredMobileIndex(snapIndex);
    };

    onSelectMobile();
    carouselApi.on('select', onSelectMobile);
    carouselApi.on('reInit', onSelectMobile);

    return () => {
      carouselApi.off('select', onSelectMobile);
      carouselApi.off('reInit', onSelectMobile);
    };
  }, [carouselApi]);

  // ── Desktop Scroll Mode check ──────────────────────────────────────────
  const checkScrollMode = useCallback(() => {
    const track = trackRef.current;
    const toolbar = toolbarRef.current;
    if (!track || !toolbar) return;

    const overflows = toolbar.scrollWidth > track.clientWidth;
    setIsScrollMode(overflows);
  }, []);

  // ── Desktop Scroll State ───────────────────────────────────────────────
  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // ── Desktop Center Project ─────────────────────────────────────────────
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

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      updateScrollState();
      updateCenteredProject();
    });
  }, [updateScrollState, updateCenteredProject]);

  const scrollLeft = () => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: -220, behavior: 'smooth' });
  };
  const scrollRight = () => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: 220, behavior: 'smooth' });
  };

  // ── Desktop Magnification Effect ───────────────────────────────────────
  useEffect(() => {
    if (isScrollMode) return;

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

  const visibleTooltip = hoveredProject || (isScrollMode ? centeredProject : null);

  return (
    <section className="mac-dock-section" aria-label="Project Navigation Dock">
      {/* ── DESKTOP DOCK (MD and up) ────────────────────────────────── */}
      <div className="mac-dock-outer-wrapper hidden md:flex">
        {/* Tooltip */}
        <div
          className={`mac-dock-tooltip ${visibleTooltip ? 'visible' : ''} ${
            !hoveredProject && centeredProject ? 'centered-mode' : ''
          }`}
        >
          {visibleTooltip && <span>{visibleTooltip.name}</span>}
        </div>

        {/* Dock scroll wrapper with chevrons */}
        <div className={`dock-scroll-wrapper ${isScrollMode ? 'scroll-mode' : ''}`}>
          <button
            type="button"
            className={`dock-chevron dock-chevron-left ${!canScrollLeft ? 'hidden' : ''}`}
            onClick={scrollLeft}
            aria-label="Scroll dock left"
          >
            <ChevronLeft size={18} />
          </button>

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

      {/* ── MOBILE 5-CARD CAROUSEL DOCK (< MD) ───────────────────────── */}
      <div className="mobile-dock-wrapper block md:hidden w-full px-2">
        {/* 5-Card Carousel Deck Centered */}
        <div className="relative w-full max-w-[21rem] sm:max-w-md mx-auto px-7 py-2">
          <Carousel
            opts={{
              align: 'center',
              loop: false,
            }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="-ml-1 items-center min-h-[105px]">
              {projects.map((p, index) => {
                const isActive = p.slug === activeSlug;
                const isCentered = index === centeredMobileIndex;

                return (
                  <CarouselItem key={p.slug || p.id || index} className="pl-1.5 basis-1/5">
                    <div className="flex flex-col items-center justify-center relative">
                      <Card
                        className={`cursor-pointer transition-all duration-300 overflow-hidden relative border-2 ${
                          isActive
                            ? 'border-[#FD6D1E] shadow-md shadow-[#FD6D1E]/25 bg-[#FFF6E9]'
                            : 'border-black/10 opacity-60 hover:opacity-90 bg-white'
                        }`}
                        onClick={() => {
                          onSelect(p);
                          carouselApi?.scrollTo(index);
                        }}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-1 relative aspect-square">
                          <div className="w-full h-full rounded-md overflow-hidden relative">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {isActive && (
                              <div className="absolute inset-0 bg-[#FD6D1E]/15 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-[#FD6D1E] shadow-[0_0_6px_#FD6D1E]" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* ONLY the card/component in the middle shows its name */}
                      {isCentered && (
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-30">
                          <span className="inline-block bg-[#222220]/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
                            {p.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Chevrons trigger sliding */}
            <CarouselPrevious className="-left-6 h-8 w-8 bg-white/95 border-black/15 text-[#222220] hover:bg-[#123524] hover:text-white shadow-sm" />
            <CarouselNext className="-right-6 h-8 w-8 bg-white/95 border-black/15 text-[#222220] hover:bg-[#123524] hover:text-white shadow-sm" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default MacDockNavigation;
