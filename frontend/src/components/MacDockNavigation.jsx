import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './MacDockNavigation.css';

const MacDockNavigation = ({ projects, activeSlug, onSelect }) => {
  const dockRef = useRef(null);
  const iconRefs = useRef([]);
  const [hoveredProject, setHoveredProject] = useState(null);

  useEffect(() => {
    const dock = dockRef.current;
    const icons = iconRefs.current.filter(Boolean);
    if (!dock || icons.length === 0) return;

    const firstIcon = icons[0];
    const min = 48; // 40px icon + margin
    const max = 120;
    const bound = min * Math.PI;

    gsap.set(icons, {
      transformOrigin: "50% 120%",
      height: 48,
    });

    gsap.set(dock, {
      position: "relative",
      height: 72,
    });

    const handleMouseMove = (event) => {
      const firstLeft = firstIcon ? firstIcon.offsetLeft : 0;
      const offset = dock.getBoundingClientRect().left + firstLeft;
      updateIcons(event.clientX - offset);
    };

    const handleMouseLeave = () => {
      setHoveredProject(null);
      gsap.to(icons, {
        duration: 0.3,
        scale: 1,
        x: 0,
        ease: "power2.out"
      });
    };

    function updateIcons(pointer) {
      for (let i = 0; i < icons.length; i++) {
        const icon = icons[i];
        if (!icon) continue;

        const distance = (i * min + min / 2) - pointer;
        let x = 0;
        let scale = 1;

        if (-bound < distance && distance < bound) {
          const rad = (distance / min) * 0.5;
          scale = 1 + (max / min - 1) * Math.cos(rad);
          x = 2 * (max - min) * Math.sin(rad);
        } else {
          x = (-bound < distance ? 2 : -2) * (max - min);
        }

        gsap.to(icon, {
          duration: 0.3,
          x: x,
          scale: scale,
          ease: "power2.out"
        });
      }
    }

    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [projects]);

  return (
    <section className="mac-dock-section" aria-label="Project Navigation Dock">
      <div className="mac-dock-outer-wrapper">
        {/* Tooltip display above hovered item */}
        <div className={`mac-dock-tooltip ${hoveredProject ? 'visible' : ''}`}>
          {hoveredProject && <span>{hoveredProject.name}</span>}
        </div>

        {/* Glidable Dock Track */}
        <div className="mac-dock-track">
          <div className="toolbar" ref={dockRef}>
            {projects.map((p, index) => {
              const isActive = p.slug === activeSlug;
              return (
                <button
                  key={p.slug || p.id}
                  ref={(el) => (iconRefs.current[index] = el)}
                  className={`toolbarItem ${isActive ? 'active' : ''}`}
                  onClick={() => onSelect(p)}
                  onMouseEnter={() => setHoveredProject(p)}
                  aria-label={`View ${p.name}`}
                  title={p.name}
                >
                  <div className="dock-icon-img-wrapper">
                    <img src={p.image} alt={p.name} className="dock-icon-img" />
                  </div>
                  {/* Selected visual cue indicator */}
                  {isActive && <span className="dock-active-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MacDockNavigation;
