import React, { useRef } from 'react';
import { getTagStyle } from '../utils/tagColors';
import './TiltCard.css';

const MAX_TILT = 9;

const TiltCard = ({ project, onClick }) => {
  const mediaRef = useRef(null);

  const handleMove = (e) => {
    const el = mediaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) scale(1.03)`;
  };

  const handleLeave = () => {
    const el = mediaRef.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <article
      className="tilt-card"
      onClick={onClick}
      data-cursor="project"
      data-cursor-text={`SEE ${project.name}`}
      data-testid={`tilt-card-${project.slug || project.id}`}
    >
      <div
        className="tilt-media"
        ref={mediaRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ backgroundImage: `url(${project.image})` }}
      >
        <div className="tilt-tags">
          {project.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="tilt-tag" style={getTagStyle(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="tilt-info">
        <h3 className="tilt-title">{project.name}</h3>
      </div>
    </article>
  );
};

export default TiltCard;
