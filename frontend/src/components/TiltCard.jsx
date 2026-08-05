import React, { useRef } from 'react';
import { getTagStyle } from '../utils/tagColors';
import { getMediaUrl } from '../utils/api';
import { isVideoMedia } from '../utils/media';
import ProjectMedia from './ProjectMedia';
import './TiltCard.css';

const MAX_TILT = 9;

const TiltCard = ({ project, onClick }) => {
  const mediaRef = useRef(null);
  const isVideoCover = isVideoMedia(project.image);

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
        // A video cover cannot be a CSS background, so it is layered in below as an
        // element instead; stills keep the background so the existing sizing is untouched.
        style={isVideoCover ? undefined : { backgroundImage: `url(${getMediaUrl(project.image)})` }}
      >
        {isVideoCover && (
          <ProjectMedia url={project.image} className="tilt-media-video" />
        )}
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
