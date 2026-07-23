import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../mock';
import './RecentProjects.css';

const RecentProjects = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const featured = projects[0];

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

  return (
    <section id="recent-projects" className="recent-projects-section">
      <div className="container">
        <article
          className="featured-card"
          ref={cardRef}
          onClick={handleClick}
          data-testid={`project-card-${featured.id}`}
        >
          <div className="featured-media">
            <img
              src={featured.image}
              alt={featured.name}
              className="rp-image"
              loading="lazy"
              decoding="async"
            />
            <div className="rp-tags">
              {featured.tags.map((tag, i) => (
                <span key={i} className="rp-tag">{tag}</span>
              ))}
            </div>
            <span className="featured-badge" data-testid="featured-work-badge">Featured Work</span>
          </div>

          <div className="featured-info">
            <h3 className="featured-title">{featured.name}</h3>
            <p className="featured-desc">{featured.description}</p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default RecentProjects;
