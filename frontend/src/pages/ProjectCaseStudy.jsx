import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { projects, slugify } from '../mock';
import MacDockNavigation from '../components/MacDockNavigation';
import './ProjectCaseStudy.css';

const ProjectCaseStudy = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const projectList = projects.map((p) => ({ ...p, slug: slugify(p.name) }));
  const currentIndex = Math.max(
    0,
    projectList.findIndex((p) => p.slug === projectId)
  );
  const project = projectList[currentIndex];

  const handleSelect = (p) => {
    if (p.slug !== project.slug) {
      setIsExpanded(false);
      navigate(`/work/${p.slug}`);
    }
  };

  const presentationImages = project.images && project.images.length > 0
    ? project.images
    : [
        project.image,
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&h=1200&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=1200&fit=crop',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&h=1200&fit=crop'
      ];

  return (
    <div className="case-study-page">
      {/* 1: Title Section (No eyebrow title) */}
      <header className="case-study-title-section">
        <div className="case-study-container">
          <h1 className="case-study-main-title">{project.name}</h1>
        </div>
      </header>

      {/* 2: Hero Page Showcase Image (Full Viewport Width 100%, Edge-to-Edge) */}
      <section className="case-study-hero-section">
        <img src={project.image} alt={project.name} className="case-study-hero-image" />
      </section>

      {/* 3: Description Section (Right-Half Side with Read More / Read Less, No dividing line) */}
      <section className="case-study-overview-section">
        <div className="case-study-container overview-grid">
          <div className="overview-left-meta">
            <span className="overview-section-label">OVERVIEW</span>
            <div className="overview-tags-list">
              {project.tags.map((tag, index) => (
                <span key={index} className="overview-tag-pill">{tag}</span>
              ))}
            </div>
          </div>

          <div className="overview-right-content">
            <p className="overview-lead-paragraph">{project.description}</p>
            
            {isExpanded && (
              <div className="overview-expanded-body">
                <p>
                  {project.name} partnered with Paper Hoof to sharpen a brand that had grown faster than its identity could keep up. We began with research — stakeholder interviews, audience mapping, and a close look at the {project.category.toLowerCase()} landscape they operate in.
                </p>
                <p>
                  From that foundation we built a cohesive visual system: a considered logo, typography, colour, and layout language designed to scale calmly across every touchpoint. Each decision was made to reinforce the story rather than decorate it.
                </p>
                <p>
                  We then rolled the system out end to end — from core identity to digital presence — crafting a seamless, confident experience that feels unmistakably {project.name}.
                </p>
              </div>
            )}

            <button
              type="button"
              className="read-more-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
              <ChevronDown className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 4: Full-Width Presentation Media Showcase (Edge-to-Edge 100%) */}
      <section className="case-study-presentation-section">
        <div className="presentation-media-stack">
          {presentationImages.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`${project.name} Showcase ${index + 1}`}
              className="presentation-long-image"
            />
          ))}
        </div>
      </section>

      {/* macOS Animated Dock at the Bottom */}
      <MacDockNavigation
        projects={projectList}
        activeSlug={project.slug}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default ProjectCaseStudy;
