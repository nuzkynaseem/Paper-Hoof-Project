import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import ReadyToMove from '../components/ReadyToMove';
import SEO from '../components/SEO';
import { getMediaUrl } from '../utils/api';
import './AboutUs.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Computes WCAG relative luminance and returns '#FFFFFF' or '#222220'
 * depending on which gives better contrast against the given hex background.
 */
const getContrastColor = (hexColor) => {
  const hex = (hexColor || '').replace('#', '');
  if (hex.length !== 6) return '#FFFFFF';
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.179 ? '#222220' : '#FFFFFF';
};

const SubFieldCard = ({ title, description, bgColor, textColor }) => {
  const cardRef = useRef(null);

  // bgColor here is always a plain hex (headingColor) so getContrastColor works correctly
  const descColor = getContrastColor(bgColor);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      className="sub-field-card"
      data-cursor="none"
      style={{ backgroundColor: bgColor, color: textColor }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sub-card-horse-watermark">
        <img src={`${process.env.PUBLIC_URL}/paperhoof-horse.svg`} alt="Paper Hoof Studio Horse Emblem" />
      </div>
      <div className="sub-card-content">
        <h4 className="sub-card-title" style={{ color: textColor }}>{title}</h4>
        <p className="sub-card-desc" style={{ color: descColor }}>{description}</p>
      </div>
    </div>
  );
};

const philosophiesData = [
  {
    id: '01',
    navTitle: '01 / CRAFT OVER CONFORMITY',
    title: 'Craft Over Conformity',
    description: 'We reject template design and generic corporate aesthetics in pursuit of distinct, bespoke brand identities built to endure and inspire.',
    bgColor: 'var(--barn-red, #D92B24)',
    textColor: 'var(--bubblegum-bloom, #FDB5ED)',
    headingColor: '#D92B24',
    subFields: [
      { title: 'Custom Typography', description: 'Bespoke typefaces and publication systems engineered for authority.' },
      { title: 'Physical Artifacts', description: 'Tactile packaging, print collateral, and physical touchpoints.' },
      { title: 'Distinctive Visual Systems', description: 'Comprehensive brand guidelines designed for calm, confident scale.' }
    ]
  },
  {
    id: '02',
    navTitle: '02 / STRATEGY IN MOTION',
    title: 'Strategy In Motion',
    description: 'Design without strategy is mere decoration. We anchor every visual choice in rigorous positioning, market clarity, and cultural movement.',
    bgColor: 'var(--tangerine-blaze, #FD6D1E)',
    textColor: 'var(--golden-straw, #FFD221)',
    headingColor: '#FD6D1E',
    subFields: [
      { title: 'Brand Architecture', description: 'Structuring complex portfolio assets for long-term clarity.' },
      { title: 'Cultural Research', description: 'Deep audience mapping and competitive differentiation.' },
      { title: 'Verbal Identity', description: 'Voice tone, brand taglines, and strategic editorial messaging.' }
    ]
  },
  {
    id: '03',
    navTitle: '03 / IMMERSIVE EXPRESSION',
    title: 'Immersive Digital Expression',
    description: 'We extend physical brand identities into living, dynamic digital spaces with high-performance web engineering and fluid motion physics.',
    bgColor: 'var(--midnight-harbor, #183165)',
    textColor: 'var(--sandy-reed, #D9D5B0)',
    headingColor: '#183165',
    subFields: [
      { title: 'Web Applications', description: 'Custom React & Vite frontend architectures built for speed.' },
      { title: 'Kinetic Motion', description: 'Smooth GSAP timelines, micro-interactions, and 3D effects.' },
      { title: 'UI Design Systems', description: 'Reusable component libraries and design tokens for web.' }
    ]
  }
];

const teamMembers = [
  {
    name: 'Nuzky Naseem',
    role: 'Co-Founder & Executive Design Officer',
    badge: 'CO-FOUNDER',
    image: '/images/team/nuzky-naseem.jpg'
  },
  {
    name: 'Abdhullah Azmin',
    role: 'Co-Founder & Executive Creative Director',
    badge: 'CO-FOUNDER',
    image: '/images/team/abdhullah-azmin.jpg'
  },
  {
    name: 'Aashik Nawas',
    role: 'Co-Founder & Executive Managing Director',
    badge: 'CO-FOUNDER',
    image: '/images/team/aashik-nawas.jpg'
  }
];

const AboutUs = () => {
  const pinSectionRef = useRef(null);
  const [openAccordion, setOpenAccordion] = useState(0);

  useEffect(() => {
    const pinSection = pinSectionRef.current;
    if (!pinSection) return;

    const list = pinSection.querySelector('.list');
    const fill = pinSection.querySelector('.fill');
    const listItems = gsap.utils.toArray('li', list);
    const slides = gsap.utils.toArray('.slide', pinSection);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSection,
          start: 'top top',
          end: '+=' + listItems.length * 40 + '%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1
        }
      });

      if (fill && listItems.length > 0) {
        gsap.set(fill, { scaleY: 1 / listItems.length, transformOrigin: 'top left' });
      }

      listItems.forEach((item, i) => {
        const previousItem = listItems[i - 1];
        const headingColor = philosophiesData[i].headingColor;
        if (previousItem) {
          tl.set(item, { color: headingColor }, 0.5 * i)
            .to(slides[i], { autoAlpha: 1, duration: 0.25 }, '<')
            .set(previousItem, { color: 'rgba(34, 34, 32, 0.4)' }, '<')
            .to(slides[i - 1], { autoAlpha: 0, duration: 0.25 }, '<');
        } else {
          gsap.set(item, { color: headingColor });
          gsap.set(slides[i], { autoAlpha: 1 });
        }
      });

      tl.to(fill, { scaleY: 1, transformOrigin: 'top left', ease: 'none', duration: tl.duration() }, 0).to({}, {});
    }, pinSection);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-us-page">
      <SEO
        title="About Paper Hoof — Independent Design & Strategy Studio"
        description="Learn about Paper Hoof Studio, our design ethos, methodology, and team."
        path="/about"
      />
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <span className="about-eyebrow">ABOUT PAPER HOOF</span>
          <h1 className="about-hero-title">WE CRAFT IDENTITIES THAT MOVE.</h1>
          <p className="about-hero-description">
            Paper Hoof is a Sri Lanka based branding and digital studio. We help visionary companies establish enduring visual authority through strategic direction, custom typography, and fluid interactive engineering.
          </p>
        </div>
      </section>

      {/* Pinned 3 Philosophies Section (Desktop only) */}
      <section ref={pinSectionRef} className="pin-section">
        <div className="pin-container">
          {/* Left Navigation Track */}
          <div className="pin-nav-col">
            <span className="pin-nav-label">OUR PHILOSOPHIES</span>
            <div className="progress-line-track">
              <div className="fill" />
            </div>
            <ul className="list">
              {philosophiesData.map((p) => (
                <li key={p.id}>{p.navTitle}</li>
              ))}
            </ul>
          </div>

          {/* Right Slides View */}
          <div className="pin-slides-col">
            {philosophiesData.map((p) => (
              <div key={p.id} className="slide">
                <div className="slide-header">
                  <span className="slide-badge" style={{ color: p.headingColor }}>
                    {p.id} / PHILOSOPHY
                  </span>
                  <h2 className="slide-title">{p.title}</h2>
                  <p className="slide-description">{p.description}</p>
                </div>
                <div className="sub-fields-grid">
                  {p.subFields.map((field, idx) => (
                    <SubFieldCard
                      key={idx}
                      title={field.title}
                      description={field.description}
                      bgColor={p.headingColor}
                      textColor={p.textColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Accordion View (< 900px) */}
      <section className="mobile-accordion-section">
        <div className="about-container">
          <span className="pin-nav-label">OUR PHILOSOPHIES</span>
          <div className="accordion-list">
            {philosophiesData.map((p, idx) => {
              const isOpen = openAccordion === idx;
              const headerTextColor = isOpen
                ? getContrastColor(p.headingColor)
                : 'rgba(32, 36, 35, 0.7)';

              return (
                <div key={p.id} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                  {/* Accordion Header — turns philosophy colour when open */}
                  <button
                    type="button"
                    className="accordion-header-btn"
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    style={{
                      color: headerTextColor,
                      backgroundColor: isOpen ? p.headingColor : 'transparent',
                    }}
                  >
                    <span className="accordion-header-title">{p.navTitle}</span>
                    <ChevronDown
                      size={22}
                      className={`accordion-chevron ${isOpen ? 'rotated' : ''}`}
                    />
                  </button>

                  {/* Accordion Body — smooth height animation via max-height */}
                  <div
                    className="accordion-content-body"
                    style={{
                      maxHeight: isOpen ? '1400px' : '0',
                      opacity: isOpen ? 1 : 0,
                      transition:
                        'max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
                    }}
                  >
                    <div className="accordion-inner-body">
                      <div className="slide-header">
                        <h2 className="slide-title">{p.title}</h2>
                        <p className="slide-description">{p.description}</p>
                      </div>
                      <div className="sub-fields-grid">
                        {p.subFields.map((field, fIdx) => (
                          <SubFieldCard
                            key={fIdx}
                            title={field.title}
                            description={field.description}
                            bgColor={p.headingColor}
                            textColor={p.textColor}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Collective Section */}
      <section className="team-section">
        <div className="about-container">
          <span className="section-eyebrow">THE TEAM</span>
          <h2 className="section-heading">THE PAPER HOOF COLLECTIVE</h2>
          <p className="team-intro">
            A tight-knit, disciplined collective of designers, strategists, and creative engineers.
          </p>

          <div className="team-divider-label">
            <span>PAPER HOOF LEADERSHIP</span>
          </div>

          <div className="team-capsules-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-capsule-card">
                {/* Floating Photo Popup on Hover (Desktop) */}
                <div className="team-photo-popup">
                  <div className="team-photo-frame">
                    <img
                      src={getMediaUrl(member.image)}
                      alt={`${member.name} — ${member.role}`}
                      className="team-popup-img"
                    />
                    <div className="team-photo-overlay" />
                  </div>
                </div>

                {/* Main Pill Capsule Button */}
                <div className="team-pill">
                  {/* Compact Avatar for Mobile */}
                  <div className="team-mobile-avatar">
                    <img
                      src={getMediaUrl(member.image)}
                      alt={`${member.name} — ${member.role}`}
                      className="team-mobile-img"
                    />
                  </div>

                  <span className="team-pill-badge">{member.badge}</span>
                  <div className="team-pill-content">
                    <h3 className="team-pill-name">{member.name}</h3>
                    <span className="team-pill-role">{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Move CTA */}
      <ReadyToMove buttonText="Give a brand review" buttonLink="/brand-review" />
    </div>
  );
};

export default AboutUs;