import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects, slugify } from '../mock';
import MacDockNavigation from '../components/MacDockNavigation';
import { getTagStyle } from '../utils/tagColors';
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
    id: 'digital-experience',
    title: 'Digital Experience',
    summary: 'Interactive components engineered with zero layout layout latency. Every transition is calibrated for spatial feel and intuitive touch response.',
  }
];

const ProjectCaseStudy = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);

  // Find target project or fallback to first
  const projectIndex = projects.findIndex(
    (p) => (p.slug || slugify(p.name)) === slug
  );
  const currentProjectIndex = projectIndex >= 0 ? projectIndex : 0;
  const project = projects[currentProjectIndex];

  // Map showcase images or provide high quality fallbacks
  const showcaseImages = (project.gallery && project.gallery.length > 0)
    ? project.gallery
    : [
        project.image,
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1600&auto=format&fit=crop"
      ];

  const handleSelectProject = (selected) => {
    const targetSlug = selected.slug || slugify(selected.name);
    navigate(`/work/${targetSlug}`);
  };

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
                <span key={index} className="overview-tag-pill" style={getTagStyle(tag)}>
                  {tag}
                </span>
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
              className="read-more-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
              <ChevronDown className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 4: Full Viewport Width Presentation Components (0px Gap Edge-to-Edge Stack) */}
      <section className="case-study-presentation-section">
        <div className="presentation-media-stack">
          {showcaseImages.map((imgUrl, index) => {
            const detail = componentDetails[index % componentDetails.length];
            const isInsightOpen = activeInsight === index;

            return (
              <div key={index} className="case-study-component-item">
                <img
                  src={imgUrl}
                  alt={`${project.name} showcase ${index + 1}`}
                  className="component-media-img"
                />

                {/* Bottom-Left Expandable Insight Button */}
                <div className="component-insight-container">
                  <AnimatePresence mode="wait">
                    {!isInsightOpen ? (
                      <motion.button
                        key="pill-btn"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="component-insight-pill"
                        onClick={() => setActiveInsight(index)}
                        aria-label={`View detail for ${detail.title}`}
                      >
                        <span className="pill-title-text">{detail.title}</span>
                        <div className="pill-plus-icon">
                          <Plus size={14} />
                        </div>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="insight-modal"
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="component-insight-modal"
                      >
                        <div className="insight-modal-header">
                          <h4 className="insight-modal-title">{detail.title}</h4>
                          <button
                            className="insight-modal-close"
                            onClick={() => setActiveInsight(null)}
                            aria-label="Close insight detail"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="insight-modal-body">{detail.summary}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5: Bottom Dock Carousel Navigation */}
      <MacDockNavigation
        projects={projects}
        activeSlug={project.slug || slugify(project.name)}
        onSelect={handleSelectProject}
      />
    </div>
  );
};

export default ProjectCaseStudy;
