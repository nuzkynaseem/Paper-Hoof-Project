import React from 'react';
import { projects } from '../mock';
import './RecentProjects.css';

const RecentProjects = () => {
  return (
    <section id="recent-projects" className="recent-projects-section">
      <div className="container">
        <h2 className="section-title">RECENT PROJECTS</h2>
        <div className="projects-grid">
          {projects.map((project) =>
          <div key={project.id} className="project-card">
              <div className="project-image-wrapper">
                <img
                src={project.image}
                alt={project.name}
                className="project-image" />

                <div className="project-tags">
                  {project.tags.map((tag, index) =>
                <span key={index} className="project-tag !my-[4px] !mx-[4px] !py-[4px] !px-[4px] !rounded">
                      {tag}
                    </span>
                )}
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-category">{project.category}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

};

export default RecentProjects;