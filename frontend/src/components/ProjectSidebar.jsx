import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './ProjectSidebar.css';

const ProjectSidebar = ({ projects, activeSlug, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const asideRef = useRef(null);
  const trackRef = useRef(null);
  const [blobTop, setBlobTop] = useState(0);

  const updateBlob = () => {
    const aside = asideRef.current;
    if (!aside) return;
    const activeEl = aside.querySelector('.sidebar-item.active');
    if (!activeEl) return;
    const asideRect = aside.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setBlobTop(elRect.top - asideRect.top + elRect.height / 2);
  };

  useLayoutEffect(() => {
    updateBlob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, expanded]);

  useEffect(() => {
    const track = trackRef.current;
    updateBlob();
    window.addEventListener('resize', updateBlob);
    if (track) track.addEventListener('scroll', updateBlob, { passive: true });
    return () => {
      window.removeEventListener('resize', updateBlob);
      if (track) track.removeEventListener('scroll', updateBlob);
    };
  }, []);

  return (
    <aside
      ref={asideRef}
      className={`project-sidebar ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      data-testid="project-sidebar"
    >
      <svg className="goo-svg" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="sidebarGoo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Gooey blob linking the active project to the screen */}
      <div className="sidebar-blob" style={{ top: `${blobTop}px` }} aria-hidden="true">
        <span className="blob-node" />
        <span className="blob-bridge" />
      </div>

      <div className="sidebar-track" ref={trackRef}>
        {projects.map((p) => (
          <button
            key={p.id}
            className={`sidebar-item ${p.slug === activeSlug ? 'active' : ''}`}
            onClick={() => onSelect(p)}
            data-testid={`sidebar-item-${p.slug}`}
            aria-label={p.name}
          >
            <span className="sidebar-thumb" style={{ backgroundImage: `url(${p.image})` }}>
              <span className="sidebar-thumb-label">{p.name}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default ProjectSidebar;
