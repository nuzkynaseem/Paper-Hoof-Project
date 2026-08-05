import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects as mockProjects, slugify } from '../mock';
import { ContainerScroll } from './ui/container-scroll-animation';
import { API_BASE } from '../utils/api';
import ProjectMedia from './ProjectMedia';
import './RecentProjects.css';

const MAX_TILT = 9;

const RecentProjects = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const [featured, setFeatured] = useState(mockProjects[0]);

  useEffect(() => {
    fetchFeaturedProject();
  }, []);

  const fetchFeaturedProject = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.featuredProject) {
          const fp = data.featuredProject;
          setFeatured({
            ...fp,
            slug: fp.slug || slugify(fp.name),
            image: fp.coverImage || fp.image,
          });
          return;
        }
      }

      const resProj = await fetch(`${API_BASE}/projects`);
      if (resProj.ok) {
        const list = await resProj.json();
        const foundFeatured = list.find((p) => p.isFeatured) || list[0];
        if (foundFeatured) {
          setFeatured({
            ...foundFeatured,
            slug: foundFeatured.slug || slugify(foundFeatured.name),
            image: foundFeatured.coverImage || foundFeatured.image,
          });
        }
      }
    } catch (err) {
      console.warn("Using default fallback featured project");
    }
  };

  const handleMouseMove = (e) => {
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
    const targetSlug = featured.slug || slugify(featured.name);
    navigate(`/work/${targetSlug}`);
  };

  return (
    <section id="recent-projects" className="recent-projects-section" ref={cardRef}>
      <div className="container recent-projects-center-container">
        <ContainerScroll>
          <div className="featured-work-center-wrapper">
            
            {/* Giant Background Typography: "FEATURED" */}
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
                {/* Cover may be a still, an animated GIF, or a video. */}
                <ProjectMedia
                  url={featured.coverImage || featured.image}
                  alt={`Paper Hoof Brand Strategy Case Study — ${featured.name}`}
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

            {/* Giant Background Typography: "WORK" */}
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
