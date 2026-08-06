import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects as mockProjects, slugify } from '../mock';
import { ContainerScroll } from './ui/container-scroll-animation';
import { getCachedJson, getProjects } from '../utils/siteData';
import ProjectMedia from './ProjectMedia';
import './RecentProjects.css';

const MAX_TILT = 9;

const RecentProjects = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  // null = loading -> skeleton card. Mock data is a last-resort failure fallback
  // only; it used to be painted first and then visibly replaced.
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let mounted = true;
    const shape = (fp) => ({
      ...fp,
      slug: fp.slug || slugify(fp.name),
      image: fp.coverImage || fp.image,
    });

    const load = async () => {
      try {
        const stats = await getCachedJson('/analytics/stats', {
          onUpdate: (fresh) => mounted && fresh && fresh.featuredProject && setFeatured(shape(fresh.featuredProject)),
        }).catch(() => null);
        if (stats && stats.featuredProject) {
          if (mounted) setFeatured(shape(stats.featuredProject));
          return;
        }
        const list = await getProjects();
        const found = list.find((p) => p.isFeatured) || list[0];
        if (mounted) setFeatured(found ? shape(found) : shape(mockProjects[0]));
      } catch (err) {
        if (mounted) setFeatured(shape(mockProjects[0]));
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
    if (!featured) return;
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
              data-cursor-text={featured ? `SEE ${featured.name}` : 'LOADING'}
              data-testid={`project-card-${featured ? featured.id : 'loading'}`}
            >
              <div className="featured-media" ref={mediaRef}>
                {!featured ? (
                  <div className="ph-skeleton rp-image single-featured-img" style={{ minHeight: 320 }} />
                ) : (
                <ProjectMedia
                  url={featured.coverImage || featured.image}
                  alt={`Paper Hoof Brand Strategy Case Study — ${featured.name}`}
                  className="rp-image single-featured-img"
                  loading="eager"
                  decoding="async"
                />
                )}

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
