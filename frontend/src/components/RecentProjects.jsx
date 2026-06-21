import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../mock';
import './RecentProjects.css';

const LAYOUT = [
  { span: 'rp-span-7', ratio: 'rp-wide' },
  { span: 'rp-span-5', ratio: 'rp-square' },
  { span: 'rp-span-5', ratio: 'rp-square' },
  { span: 'rp-span-7', ratio: 'rp-wide' },
  { span: 'rp-span-6', ratio: 'rp-classic' },
  { span: 'rp-span-6', ratio: 'rp-classic' },
];

const RecentProjects = () => {
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current ? gridRef.current.querySelectorAll('.rp-card') : [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const handleProjectClick = (name) => {
    navigate(`/work/${name.toLowerCase().replace(/ /g, '-')}`);
  };

  return (
    <section id="recent-projects" className="recent-projects-section">
      <div className="container">
        <div className="rp-header">
          <h2 className="rp-section-title" data-testid="recent-projects-title">Recent Projects</h2>
        </div>

        <div className="rp-grid" ref={gridRef}>
          {projects.map((project, index) => {
            const layout = LAYOUT[index % LAYOUT.length];
            return (
              <article
                key={project.id}
                className={`rp-card ${layout.span} ${layout.ratio}`}
                style={{ transitionDelay: `${(index % LAYOUT.length) * 80}ms` }}
                onClick={() => handleProjectClick(project.name)}
                data-testid={`project-card-${project.id}`}
              >
                <div className="rp-media">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="rp-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="rp-tags">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="rp-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="rp-info">
                  <h3 className="rp-title">{project.name}</h3>
                  <p className="rp-desc">{project.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
