import React, { useEffect, useState } from 'react';
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
  const [carouselApi, setCarouselApi] = useState(null);

  // Sync active project to carousel position when activeSlug changes or carousel mounts
  useEffect(() => {
    if (!carouselApi) return;
    const activeIdx = projects.findIndex((p) => p.slug === activeSlug);
    if (activeIdx >= 0) {
      carouselApi.scrollTo(activeIdx);
    }
  }, [carouselApi, activeSlug, projects]);

  return (
    <section className="mac-dock-section" aria-label="Project Navigation Dock">
      <div className="dock-carousel-wrapper w-full px-4">
        <div className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-8 py-2">
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
                            : 'border-black/10 opacity-80 hover:opacity-100 hover:border-[#FD6D1E]/50 bg-white'
                        }`}
                        onClick={() => {
                          onSelect(p);
                          carouselApi?.scrollTo(index);
                        }}
                      >
                        <CardContent className="flex flex-col items-center justify-between p-2.5 h-full">
                          <div className="w-full aspect-square rounded-md overflow-hidden relative mb-2">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
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

            {/* Chevrons trigger sliding left/right */}
            <CarouselPrevious className="-left-7 h-9 w-9 bg-white/95 border-black/15 text-[#222220] hover:bg-[#123524] hover:text-white shadow-sm" />
            <CarouselNext className="-right-7 h-9 w-9 bg-white/95 border-black/15 text-[#222220] hover:bg-[#123524] hover:text-white shadow-sm" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default MacDockNavigation;
