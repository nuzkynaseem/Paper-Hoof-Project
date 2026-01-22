import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import './ProjectCaseStudy.css';

const ProjectCaseStudy = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock project data
  const projectData = {
    name: 'Burger Hot',
    date: '25th December 2025',
    location: 'Mawanella, Sri Lanka',
    tags: ['BRANDING', 'IDENTITY', 'UI/UX'],
    shortDescription: 'A complete rebrand for Burger Hot, reimagining the fast-food experience through considered design, cohesive visual systems, and thoughtful customer touchpoints.',
    fullDescription: `Burger Hot approached Branfern with a clear challenge: their brand had grown organically over the years, but lacked cohesion. The visual identity felt dated, the customer experience was inconsistent across channels, and their positioning no longer reflected their values of quality, sustainability, and community.

Our work began with deep research. We conducted stakeholder interviews, customer surveys, and competitive analysis. We mapped the entire customer journey, from discovery to loyalty. What emerged was a clear insight: Burger Hot wasn't just selling burgers—they were creating moments of connection.

The rebrand centered on this idea. We developed a new visual identity that felt warm, approachable, and premium. The logo, typography, color palette, and illustration style all worked together to create a distinctive look that could scale across physical and digital touchpoints.

We designed a complete suite of materials: packaging, menu boards, store signage, uniforms, website, app, and social media templates. Every element was crafted to reinforce the brand story and create a seamless experience.

The result is a brand that feels confident, modern, and unmistakably Burger Hot.`,
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&h=800&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1400&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1400&h=800&fit=crop'
    ]
  };

  const prevProject = { 
    name: 'Odera', 
    id: 'odera',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop'
  };
  const nextProject = { 
    name: 'Yaloo', 
    id: 'yaloo',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=400&fit=crop'
  };

  return (
    <div className="case-study-page">
      {/* Hero Section */}
      <section className="case-study-hero">
        <div className="case-study-hero-container">
          <div className="hero-left">
            <h1 className="case-study-title">{projectData.name}</h1>
            <div className="case-study-gradient-divider"></div>
            <div className="case-study-meta">
              <span className="meta-date">{projectData.date}</span>
              <span className="meta-separator">•</span>
              <span className="meta-location">{projectData.location}</span>
            </div>
            <div className="case-study-tags">
              {projectData.tags.map((tag, index) => (
                <span key={index} className="case-tag">{tag}</span>
              ))}
            </div>
            <p className="case-study-short-desc">{projectData.shortDescription}</p>
          </div>
        </div>
      </section>

      {/* Sticky About Button */}
      <button 
        className="sticky-about-button"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      >
        <span>About the project</span>
        {isDrawerOpen ? <X size={20} /> : <Plus size={20} />}
      </button>

      {/* Left Drawer */}
      <div className={`project-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          <h3 className="drawer-title">About the Project</h3>
          <div className="drawer-text">
            {projectData.fullDescription.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Content */}
      <div className={`case-study-content ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className="content-container">
          {projectData.images.map((image, index) => (
            <div key={index} className="content-image-block">
              <img src={image} alt={`${projectData.name} ${index + 1}`} className="content-image" />
            </div>
          ))}

          <div className="content-text-block">
            <h2 className="content-heading">The Challenge</h2>
            <p className="content-paragraph">
              Burger Hot's existing brand identity had served them well for over a decade, but the market had evolved. Customers now expected more: transparency about ingredients, sustainable practices, and meaningful brand values. The visual identity needed to reflect this evolution while maintaining brand recognition.
            </p>
          </div>

          <div className="content-image-block">
            <img src={projectData.images[0]} alt="Process" className="content-image" />
          </div>

          <div className="content-text-block">
            <h2 className="content-heading">The Solution</h2>
            <p className="content-paragraph">
              We created a modular design system that could adapt to any context. The core visual language—bold typography, warm color palette, and clean layouts—remained consistent, while allowing flexibility for seasonal campaigns, limited editions, and local store variations.
            </p>
          </div>
        </div>
      </div>

      {/* Project Navigation */}
      <section className="project-navigation">
        <div className="nav-container">
          <div className="nav-item prev" onClick={() => navigate(`/work/${prevProject.id}`)}>
            <div className="nav-image-wrapper">
              <img src={prevProject.image} alt={prevProject.name} className="nav-project-image" />
            </div>
            <div className="nav-content">
              <span className="nav-label">Previous Project</span>
              <h3 className="nav-project-name">{prevProject.name}</h3>
            </div>
          </div>
          <div className="nav-item next" onClick={() => navigate(`/work/${nextProject.id}`)}>
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