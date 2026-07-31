import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { projects as mockProjects, slugify } from '../mock';
import TiltCard from './TiltCard';
import { API_BASE } from '../utils/api';
import './MoreWorks.css';

const MoreWorks = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    let limit = 4;
    try {
      const resConfig = await fetch(`${API_BASE}/site/homepage`);
      if (resConfig.ok) {
        const configData = await resConfig.json();
        if (configData.homepageProjectsLimit) {
          limit = configData.homepageProjectsLimit;
        }
      }
    } catch (e) {
      console.warn("Using default limit 4");
    }

    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const list = await res.json();
        if (list && list.length > 0) {
          const nonFeatured = list.filter((p) => !p.isFeatured);
          const displayList = nonFeatured.length > 0 ? nonFeatured : list;
          const formatted = displayList.slice(0, limit).map((p) => ({
            ...p,
            slug: p.slug || slugify(p.name),
            image: p.coverImage || p.image,
          }));
          setWorks(formatted);
          return;
        }
      }
    } catch (err) {
      console.warn("Using fallback more works");
    }

    setWorks(mockProjects.slice(1, 1 + limit).map((p) => ({ ...p, slug: slugify(p.name) })));
  };

  return (
    <section className="more-works-section">
      <div className="container">
        <div className="more-works-header">
          <button
            className="more-works-btn"
            onClick={() => navigate('/work')}
            data-testid="more-works-button"
          >
            More Works <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="tilt-grid">
          {works.map((project) => (
            <TiltCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/work/${project.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreWorks;
