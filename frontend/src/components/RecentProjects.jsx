import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { projects } from '../mock';
import { ContainerScroll } from './ui/container-scroll-animation';
import './RecentProjects.css';

const RecentProjects = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const featured = projects[0];
  const slideImages = featured.images || [featured.image];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play slider timer
  useEffect(() => {
    if (slideImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slideImages.length, isPaused]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    navigate(`/work/${featured.name.toLowerCase().replace(/ /g, '-')}`);
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slideImages.length);
  };

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    setCurrentSlide(index);
  };

  const titleComponent = (
    <div className="featured-side-info">
      <div className="featured-section-label">
        <span className="label-dot"></span>
        FEATURED WORK
      </div>
      <h2 className="featured-side-title">{featured.name}</h2>
      <p className="featured-side-desc">{featured.description}</p>
      
      <div className="featured-side-tags">
        {featured.tags.map((tag, i) => (
          <span key={i} className="featured-side-tag">{tag}</span>
        ))}
      </div>

      <button
        type="button"
        className="featured-side-cta"
        onClick={handleClick}
        data-testid="featured-view-btn"
      >
        <span>Explore Case Study</span>
        <ArrowUpRight size={18} />
      </button>
    </div>
  );

  return (
    <section id="recent-projects" className="recent-projects-section" ref={cardRef}>
      <div className="container">
        <ContainerScroll titleComponent={titleComponent}>
          <article
            className="featured-scroll-card"
            onClick={handleClick}
            data-testid={`project-card-${featured.id}`}
          >
            <div
              className="featured-media"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {slideImages.map((imgSrc, idx) => (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={`${featured.name} slide ${idx + 1}`}
                  className={`rp-image ${idx === currentSlide ? 'active' : ''}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ))}

              {/* Corner-wrapping Featured Work Banner */}
              <div className="featured-corner-banner" data-testid="featured-work-badge">
                <span>Featured Work</span>
              </div>

              {/* Slider Controls */}
              {slideImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="slider-arrow slider-arrow-prev"
                    onClick={handlePrevSlide}
                    aria-label="Previous slide"
                    data-testid="slider-prev-btn"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="slider-arrow slider-arrow-next"
                    onClick={handleNextSlide}
                    aria-label="Next slide"
                    data-testid="slider-next-btn"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="slider-dots" data-testid="slider-dots">
                    {slideImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={(e) => handleDotClick(e, idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        data-testid={`slider-dot-${idx}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </article>
        </ContainerScroll>
      </div>
    </section>
  );
};

export default RecentProjects;
