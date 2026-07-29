import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../mock';
import { ContainerScroll } from './ui/container-scroll-animation';
import './RecentProjects.css';

const MAX_TILT = 9;

const RecentProjects = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const featured = projects[0];

  const handleMouseMove = (e) => {
    // 3D Mouse Tilt Calculation
    const el = mediaRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) scale(1.02)`;
    }
  };

  const handleMouseLeave = () => {
    const el = mediaRef.current;
    if (el) {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  const handleClick = () => {
    navigate(`/work/${featured.name.toLowerCase().replace(/ /g, '-')}`);
  };

  return (
    <section id="recent-projects" className="recent-projects-section" ref={cardRef}>
      <div className="container recent-projects-center-container">
        <ContainerScroll>
          <div className="featured-work-center-wrapper">
            
            {/* Giant Background Typography: "FEATURED" (75% visible on left side of project container) */}
            <span className="featured-bg-text text-left-featured">
              FEATURED
            </span>

            {/* Middle Featured Work Project Card */}
            <article
              className="featured-scroll-card"
              onClick={handleClick}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              data-cursor="project"
              data-cursor-text={`SEE ${featured.name}`}
              data-testid={`project-card-${featured.id}`}
            >
              <div className="featured-media" ref={mediaRef}>
                <img
                  src={featured.image}
                  alt={featured.name}
                  className="rp-image single-featured-img"
                  loading="eager"
                  decoding="async"
                />

                {/* Corner-wrapping Featured Work Banner */}
                <div className="featured-corner-banner" data-testid="featured-work-badge">
                  <span>Featured Work</span>
                </div>
              </div>
            </article>

            {/* Giant Background Typography: "WORK" (Visible on right side of project container) */}
            <span className="featured-bg-text text-right-work">
              WORK
            </span>

          </div>
        </ContainerScroll>
      </div>
    </section>
  );
};

export default RecentProjects;
