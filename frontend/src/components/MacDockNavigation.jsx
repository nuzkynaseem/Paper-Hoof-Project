import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import ProjectMedia from './ProjectMedia';
import './MacDockNavigation.css';

/**
 * Dock tile artwork: the slider/dock image when set, otherwise the cover.
 *
 * The fallback runs through state rather than by rewriting the element's src, because
 * the replacement may be a different kind of media (a video cover standing in for a
 * missing image) and only a re-render can swap <video> for <img>.
 */
const DockTileMedia = ({ project }) => {
  const [useFallback, setUseFallback] = useState(false);

  const primary = project.sliderImage || project.coverImage || project.image;
  const fallback = project.coverImage || project.image;

  return (
    <ProjectMedia
      url={useFallback ? fallback : primary}
      alt={`Paper Hoof Portfolio Case Study — ${project.name}`}
      className="w-full h-full object-cover"
      onError={() => {
        if (!useFallback && fallback && fallback !== primary) setUseFallback(true);
      }}
    />
  );
};

const MacDockNavigation = ({ projects, activeSlug, onSelect }) => {
  const [carouselApi, setCarouselApi] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Sync active project to carousel position when activeSlug changes or carousel mounts
  useEffect(() => {
    if (!carouselApi) return;
    const activeIdx = projects.findIndex((p) => p.slug === activeSlug);
    if (activeIdx >= 0) {
      carouselApi.scrollTo(activeIdx);
    }
  }, [carouselApi, activeSlug, projects]);

  // Track scroll state for chevron enabling/disabling
  const onSelectCarousel = useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    onSelectCarousel(carouselApi);
    carouselApi.on('reInit', onSelectCarousel);
    carouselApi.on('select', onSelectCarousel);

    return () => {
      carouselApi.off('select', onSelectCarousel);
    };
  }, [carouselApi, onSelectCarousel]);

  return (
    <section className="mac-dock-section" aria-label="Project Navigation Dock">
      <div className="dock-carousel-wrapper w-full px-4">
        {/* Flex container placing chevrons on both sides of the cards with clean padding */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto py-2">
          
          {/* Left Chevron on left side of cards */}
          <button
            type="button"
            onClick={() => carouselApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous Project"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/95 border border-black/15 text-[#222220] flex items-center justify-center shadow-md hover:bg-[#123524] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Carousel Deck Container */}
          <div className="flex-1 overflow-hidden">
            <Carousel
              opts={{
                align: 'start',
                loop: false,
              }}
              setApi={setCarouselApi}
              className="w-full"
            >
              <CarouselContent className="-ml-2 items-stretch">
                {projects.map((p, index) => {
                  const isActive = p.slug === activeSlug;

                  return (
                    <CarouselItem
                      key={p.slug || p.id || index}
                      className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                    >
                      <div className="h-full p-1">
                        <Card
                          className={`h-full cursor-pointer transition-all duration-300 overflow-hidden relative border-2 ${
                            isActive
                              ? 'border-[#FD6D1E] shadow-md shadow-[#FD6D1E]/25 bg-[#FFF6E9]'
                              : 'border-black/10 opacity-85 hover:opacity-100 hover:border-[#FD6D1E]/50 bg-white'
                          }`}
                          onClick={() => {
                            onSelect(p);
                            carouselApi?.scrollTo(index);
                          }}
                        >
                          <CardContent className="flex flex-col items-center justify-between p-2.5 h-full">
                            <div className="w-full aspect-square rounded-md overflow-hidden relative mb-2">
                              <DockTileMedia project={p} />
                              {isActive && (
                                <div className="absolute inset-0 bg-[#FD6D1E]/15 flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#FD6D1E] shadow-[0_0_8px_#FD6D1E]" />
                                </div>
                              )}
                            </div>

                            {/* All project cards are properly named */}
                            <span
                              className={`text-xs w-full text-center truncate ${
                                isActive
                                  ? 'font-extrabold text-[#FD6D1E]'
                                  : 'font-semibold text-[#222220]'
                              }`}
                              title={p.name}
                            >
                              {p.name}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Right Chevron on right side of cards */}
          <button
            type="button"
            onClick={() => carouselApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next Project"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/95 border border-black/15 text-[#222220] flex items-center justify-center shadow-md hover:bg-[#123524] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MacDockNavigation;
