import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { projects, slugify } from '../mock';
import ProjectSlideDeck from '../components/ProjectSlideDeck';
import MacDockNavigation from '../components/MacDockNavigation';
import './ProjectCaseStudy.css';

const ProjectCaseStudy = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const projectList = projects.map((p) => ({ ...p, slug: slugify(p.name) }));
  const currentIndex = Math.max(
    0,
    projectList.findIndex((p) => p.slug === projectId)
  );
  const project = projectList[currentIndex];

  const fullDescription = `${project.name} partnered with Paper Hoof to sharpen a brand that had grown faster than its identity could keep up. We began with research — stakeholder interviews, audience mapping, and a close look at the ${project.category.toLowerCase()} landscape they operate in.

From that foundation we built a cohesive visual system: a considered logo, typography, colour, and layout language designed to scale calmly across every touchpoint. Each decision was made to reinforce the story rather than decorate it.

We then rolled the system out end to end — from core identity to digital presence — crafting a seamless, confident experience that feels unmistakably ${project.name}.`;

  const handleSelect = (p) => {
    if (p.slug !== project.slug) {
      setIsDrawerOpen(false);
      navigate(`/work/${p.slug}`);
    }
  };

  return (
    <div className="case-study-page">
      {/* Immersive JKR Global Style Slide Deck at Top (Replaces old text title/location header) */}
      <section className="case-study-slide-deck-section">
        <ProjectSlideDeck project={project} />
      </section>

      {/* Sticky About Button */}
      <button
        className="sticky-about-button"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        data-testid="about-project-button"
      >
        <span>About the project</span>
        {isDrawerOpen ? <X size={20} /> : <Plus size={20} />}
      </button>

      {/* Left Drawer */}
      <div className={`project-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          <h3 className="drawer-title">About {project.name}</h3>
          <div className="drawer-text">
            {fullDescription.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Content */}
      <div className={`case-study-content ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className="content-container">
          <div className="content-image-block">
            <img src={project.image} alt={project.name} className="content-image" />
          </div>

          <div className="content-text-block">
            <h2 className="content-heading">The Challenge</h2>
            <p className="content-paragraph">
              {project.name}'s existing identity had served them well, but the market had moved on.
              The brand needed a system that felt current, cohesive, and true to their values —
              while staying recognisable across every context.
            </p>
          </div>

          <div className="content-image-block">
            <img src={project.image} alt={`${project.name} process`} className="content-image" />
          </div>

          <div className="content-text-block">
            <h2 className="content-heading">The Solution</h2>
            <p className="content-paragraph">
              We created a modular design language — bold typography, a warm palette, and clean
              layouts — that stays consistent yet flexible enough for campaigns, editions, and
              local variations. The result is confident, modern, and unmistakably {project.name}.
            </p>
          </div>
        </div>
      </div>

      {/* macOS Animated Dock at the Bottom of Project (Replaces old sidebar & prev/next cues) */}
      <MacDockNavigation
        projects={projectList}
        activeSlug={project.slug}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default ProjectCaseStudy;
