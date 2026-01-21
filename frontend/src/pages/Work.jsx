import React from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../mock';
import './Work.css';

const Work = () => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    navigate(`/work/${projectId}`);
  };

  return (
    <div className="work-page">
      {/* Hero Section */}
      <section className="work-hero">
        <div className="hero-gradient-overlay"></div>
        <div className="work-hero-container">
          <div className="work-hero-content">
            <h1 className="work-hero-title">Our Work</h1>
            <div className="work-hero-divider-gradient"></div>
            <p className="work-hero-description">
              Branfern's ambition is to operate at the intersection of design, systems, and culture. We aim to build holistic brand ecosystems where strategy, identity, and experience work as one. Our work is not to follow the industry's pace, but to define our own: thoughtful, rigorous, and sustainable.
            </p>
          </div>
          <div className="work-hero-right">
            <div className="work-display">
              <span className="work-text">WORK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="work-projects-section">
        <div className="work-projects-container">
          <h2 className="work-section-title">RECENT PROJECTS</h2>
          <div className="work-projects-grid">
            {/* Featured Project - Large */}
            <div 
              className="work-project-card featured"
              onClick={() => handleProjectClick('burger-hot')}
            >
              <div className="project-image-wrapper">
                <img 
                  src={projects[0].image} 
                  alt={projects[0].name} 
                  className="project-image"
                />
                <div className="project-tags">
                  {projects[0].tags.map((tag, index) => (
                    <span key={index} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-name">{projects[0].name}</h3>
                <p className="project-category">{projects[0].category}</p>
              </div>
            </div>

            {/* Small Projects - Right Side */}
            <div 
              className="work-project-card small"
              onClick={() => handleProjectClick('odera')}
            >
              <div className="project-image-wrapper">
                <img 
                  src={projects[1].image} 
                  alt={projects[1].name} 
                  className="project-image"
                />
                <div className="project-tags">
                  {projects[1].tags.map((tag, index) => (
                    <span key={index} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-name">{projects[1].name}</h3>
                <p className="project-category">{projects[1].category}</p>
              </div>
            </div>

            <div 
              className="work-project-card small"
              onClick={() => handleProjectClick('yaloo')}
            >
              <div className="project-image-wrapper">
                <img 
                  src={projects[2].image} 
                  alt={projects[2].name} 
                  className="project-image"
                />
                <div className="project-tags">
                  {projects[2].tags.map((tag, index) => (
                    <span key={index} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-name">{projects[2].name}</h3>
                <p className="project-category">{projects[2].category}</p>
              </div>
            </div>

            {/* Bottom Row - Three Projects */}
            {projects.slice(3, 6).map((project, index) => (
              <div 
                key={project.id}
                className="work-project-card medium"
                onClick={() => handleProjectClick(project.name.toLowerCase().replace(' ', '-'))}
              >
                <div className="project-image-wrapper">
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="project-image"
                  />
                  <div className="project-tags">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="project-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="project-info">
                  <h3 className="project-name">{project.name}</h3>
                  <p className="project-category">{project.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Work;