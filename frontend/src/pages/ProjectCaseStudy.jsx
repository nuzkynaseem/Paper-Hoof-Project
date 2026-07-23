import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { projects, slugify } from '../mock';
import ProjectSidebar from '../components/ProjectSidebar';
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

  const prevProject = projectList[(currentIndex - 1 + projectList.length) % projectList.length];
  const nextProject = projectList[(currentIndex + 1) % projectList.length];

  const shortDescription = project.description;
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
      <ProjectSidebar projects={projectList} activeSlug={project.slug} onSelect={handleSelect} />

      {/* Hero Section */}
      <section className="case-study-hero">
        <div className="case-study-hero-container">
          <div className="hero-left">
            <h1 className="case-study-title">{project.name}</h1>
            <div className="case-study-gradient-divider"></div>
            <div className="case-study-meta">
              <span className="meta-date">25th December 2025</span>
              <span className="meta-separator">•</span>
              <span className="meta-location">Mawanella, Sri Lanka</span>
            </div>
            <div className="case-study-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="case-tag">{tag}</span>
              ))}
            </div>
            <p className="case-study-short-desc">{shortDescription}</p>
          </div>
        </div>
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
          <h3 className="drawer-title">About the Project</h3>
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

      {/* Project Navigation */}
      <section className="project-navigation">
        <div className="nav-container">
          <div className="nav-item prev" onClick={() => navigate(`/work/${prevProject.slug}`)}>
            <div className="nav-image-wrapper">
              <img src={prevProject.image} alt={prevProject.name} className="nav-project-image" />
            </div>
            <div className="nav-content">
              <span className="nav-label">Previous Project</span>
              <h3 className="nav-project-name">{prevProject.name}</h3>
            </div>
          </div>
          <div className="nav-item next" onClick={() => navigate(`/work/${nextProject.slug}`)}>
            <div className="nav-image-wrapper">
              <img src={nextProject.image} alt={nextProject.name} className="nav-project-image" />
            </div>
            <div className="nav-content">
              <span className="nav-label">Next Project</span>
              <h3 className="nav-project-name">{nextProject.name}</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectCaseStudy;
