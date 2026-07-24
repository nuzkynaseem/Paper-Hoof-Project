import React from 'react';
import { useNavigate } from 'react-router-dom';
import { projects, slugify } from '../mock';
import TiltCard from '../components/TiltCard';

const Work = () => {
  const navigate = useNavigate();
  const projectList = projects.map((p) => ({ ...p, slug: slugify(p.name) }));

  return (
    <div className="work-page-min">
      <div className="container">
        <div className="tilt-grid">
          {projectList.map((project) => (
            <TiltCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/work/${project.slug}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
