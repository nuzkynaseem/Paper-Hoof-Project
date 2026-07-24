import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { projects, slugify } from '../mock';
import TiltCard from './TiltCard';
import './MoreWorks.css';

const MoreWorks = () => {
  const navigate = useNavigate();
  const four = projects.slice(1, 5).map((p) => ({ ...p, slug: slugify(p.name) }));

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
          {four.map((project) => (
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
