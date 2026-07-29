import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects, slugify } from '../mock';
import MacDockNavigation from '../components/MacDockNavigation';
import './ProjectCaseStudy.css';

const componentDetails = [
  {
    id: 'logotype',
    title: 'Logotype',
    summary: 'Built on refined geometry, the logotype feels simple, confident, and approachable. The continuous line introduces a sense of flow that echoes the ability to move intelligently through complex environments. In motion, a smooth weight shift adds a sensing, responsive quality.',
  },
  {
    id: 'visual-identity',
    title: 'Visual Identity System',
    summary: 'Our visual language pairs high-contrast typographic hierarchy with fluid grid alignments. Built to adapt across digital displays and tactile physical touchpoints without losing structural harmony.',
  },
  {
    id: 'color-palette',
    title: 'Color Architecture',
    summary: 'Curated color palettes balance functional clarity with emotional depth. The tones shift dynamically from subtle warm neutrals to high-contrast focal accents.',
  },
  {
    id: 'brand-touchpoints',
    title: 'Brand Touchpoints',
    summary: 'From interactive digital platforms to physical environmental assets, every component is systematically engineered for consistency, speed, and lasting impact.',
  }
];

const CaseStudyComponent = ({ imgUrl, index, project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const detail = componentDetails[index % componentDetails.length];
  const title = detail ? detail.title : `Component 0${index + 1}`;
  const summary = detail
    ? detail.summary
    : `Built on refined geometry and systematic layout rules, this component defines ${project.name}'s visual identity and brand architecture.`;

  return (
    <div className="case-study-component-item">
      {/* Component Media (Always fills 100% viewport width) */}
      <img
        src={imgUrl}
        alt={`${project.name} ${title}`}
        className="component-media-img"
      />

      {/* Bottom-Left Pill Badge & Smooth Non-Liquid Expandable Modal */}
      <div className="component-insight-container">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="pill"
              type="button"
              className="component-insight-pill"
              onClick={() => setIsOpen(true)}
              aria-expanded="false"
              initial={{ opacity: 0, scale: 0.94, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              data-testid={`insight-pill-${index}`}
            >
              <span className="pill-title-text">{title}</span>
              <div className="pill-plus-icon">
                <Plus size={14} />
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="modal"
              className="component-insight-modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="insight-modal-header">
                <h3 className="insight-modal-title">{title}</h3>
                <button
                  type="button"
                  className="insight-modal-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close component details"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="insight-modal-body">{summary}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

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
      {/* 1: Title Section */}
      <header className="case-study-title-section">
        <div className="case-study-container">
          <h1 className="case-study-main-title">{project.name}</h1>
        </div>
      </header>

      {/* 2: Hero Page Showcase Image (Full Viewport Width 100%, Edge-to-Edge) */}
      <section className="case-study-hero-section">
        <img src={project.image} alt={project.name} className="case-study-hero-image" />
      </section>

      {/* 3: Description Section (Right-Half Side Layout with Read More / Read Less) */}
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

      {/* 4: Full-Width Presentation Media Showcase (Edge-to-Edge 100% Viewport Width, 0px Gap) */}
      <section className="case-study-presentation-section">
        <div className="presentation-media-stack">
          {presentationImages.map((imgUrl, index) => (
            <CaseStudyComponent
              key={index}
              imgUrl={imgUrl}
              index={index}
              project={project}
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
