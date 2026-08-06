import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { projects as mockProjects, slugify } from '../mock';
import TiltCard from './TiltCard';
import { getHomepage, getProjects } from '../utils/siteData';
import './MoreWorks.css';

const MoreWorks = () => {
  const navigate = useNavigate();
  // null = loading -> skeleton tiles; mock only if the API genuinely fails.
  const [works, setWorks] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      let limit = 4;
      try {
        const configData = await getHomepage();
        if (configData && configData.homepageProjectsLimit) {
          limit = configData.homepageProjectsLimit;
        }
      } catch (e) {
        /* default limit stands */
      }

      try {
        const list = await getProjects();
        if (list.length > 0) {
          const nonFeatured = list.filter((p) => !p.isFeatured);
          const displayList = nonFeatured.length > 0 ? nonFeatured : list;
          if (mounted) {
            setWorks(displayList.slice(0, limit).map((p) => ({
              ...p,
              slug: p.slug || slugify(p.name),
              image: p.coverImage || p.image,
            })));
          }
          return;
        }
      } catch (err) {
        /* fall through to mock */
      }
      if (mounted) {
        setWorks(mockProjects.slice(1, 1 + limit).map((p) => ({ ...p, slug: slugify(p.name) })));
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
          {works === null &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="ph-skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 16 }} />
            ))}
          {(works || []).map((project) => (
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
