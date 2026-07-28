import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { projects, slugify } from '../mock';
import ProjectSlideDeck from '../components/ProjectSlideDeck';
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

  return (
    <div className="case-study-page">
      {/* 1: Title Section */}
      <header className="case-study-title-section">
        <div className="case-study-container">
          <span className="case-study-category-badge">{project.category}</span>
          <h1 className="case-study-main-title">{project.name}</h1>
        </div>
      </header>

      {/* 2: Hero Page (Full Showcase Media) */}
      <section className="case-study-hero-section">
        <div className="case-study-container">
          <div className="case-study-hero-image-wrapper">
            <img src={project.image} alt={project.name} className="case-study-hero-image" />
          </div>
        </div>
      </section>

      {/* 3: Description Section (Right Half Side with Read More / Read Less Expandable Toggle) */}
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

      {/* 4: Complete Immersive Presentation Slide Deck */}
      <section className="case-study-deck-section">
        <div className="case-study-container">
          <div className="deck-section-header">
            <span className="deck-section-label">PRESENTATION DECK</span>
          </div>
          <ProjectSlideDeck project={project} />
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
