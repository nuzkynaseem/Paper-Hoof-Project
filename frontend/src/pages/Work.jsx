import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects as mockProjects, slugify } from '../mock';
import TiltCard from '../components/TiltCard';
import { getProjects } from '../utils/siteData';

import SEO from '../components/SEO';

const Work = () => {
  const navigate = useNavigate();
  // null = loading -> skeleton grid; mock only if the API genuinely fails.
  const [projectList, setProjectList] = useState(null);

  useEffect(() => {
    let mounted = true;
    const shape = (data) =>
      data.map((p) => ({
        ...p,
        slug: p.slug || slugify(p.name),
        image: p.coverImage || p.image,
      }));
    getProjects({ onUpdate: (data) => mounted && data.length > 0 && setProjectList(shape(data)) })
      .then((data) => {
        if (!mounted) return;
        if (data.length > 0) {
          setProjectList(shape(data));
        } else {
          setProjectList(mockProjects.map((p) => ({ ...p, slug: slugify(p.name) })));
        }
      })
      .catch(() => {
        if (mounted) setProjectList(mockProjects.map((p) => ({ ...p, slug: slugify(p.name) })));
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="work-page-min">
      <SEO
        title="Selected Work & Portfolio — Paper Hoof Studio"
        description="Explore our selected brand identity, digital design, and strategy projects at Paper Hoof Studio."
        path="/work"
      />
      <div className="container">
        <div className="tilt-grid">
          {projectList === null &&
            [0, 1, 2, 3, 5, 6].map((i) => (
              <div key={i} className="ph-skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 16 }} />
            ))}
          {(projectList || []).map((project) => (
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
