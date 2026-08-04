import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects as mockProjects, slugify } from '../mock';
import TiltCard from '../components/TiltCard';
import { API_BASE } from '../utils/api';

import SEO from '../components/SEO';

const Work = () => {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const formatted = data.map((p) => ({
            ...p,
            slug: p.slug || slugify(p.name),
            image: p.coverImage || p.image,
          }));
          setProjectList(formatted);
          return;
        }
      }
    } catch (e) {
      console.warn("Using fallback projects list");
    }

    setProjectList(mockProjects.map((p) => ({ ...p, slug: slugify(p.name) })));
  };

  return (
    <div className="work-page-min">
      <SEO
        title="Selected Work & Portfolio — Paper Hoof Studio"
        description="Explore our selected brand identity, digital design, and strategy projects at Paper Hoof Studio."
        path="/work"
      />
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
