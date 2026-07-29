import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import ReadyToMove from '../components/ReadyToMove';
import './AboutUs.css';

gsap.registerPlugin(ScrollTrigger);

const SubFieldCard = ({ title, description, bgColor, textColor, descColor }) => {
  const cardRef = useRef(null);

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
        <img src={`${process.env.PUBLIC_URL}/paperhoof-horse.svg`} alt="" />
      </div>
      <div className="sub-card-content">
        <h4 className="sub-card-title" style={{ color: textColor }}>{title}</h4>
        <p className="sub-card-desc" style={{ color: descColor || '#FFFFFF' }}>{description}</p>
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
    descColor: '#FFFFFF', // High-contrast White for Barn Red
    headingColor: '#D92B24', // Barn Red heading
    subFields: [
      {
        title: 'Custom Typography',
        description: 'Bespoke typefaces and publication systems engineered for authority.'
      },
      {
        title: 'Physical Artifacts',
        description: 'Tactile packaging, print collateral, and physical touchpoints.'
      },
      {
        title: 'Distinctive Visual Systems',
        description: 'Comprehensive brand guidelines designed for calm, confident scale.'
      }
    ]
  },
  {
    id: '02',
    navTitle: '02 / STRATEGY IN MOTION',
    title: 'Strategy In Motion',
    description: 'Design without strategy is mere decoration. We anchor every visual choice in rigorous positioning, market clarity, and cultural movement.',
    bgColor: 'var(--tangerine-blaze, #FD6D1E)',
    textColor: 'var(--golden-straw, #FFD221)',
    descColor: '#222220', // High-contrast Dark Soot / Charcoal for Tangerine Blaze
    headingColor: '#FD6D1E', // Tangerine Blaze heading
    subFields: [
      {
        title: 'Brand Architecture',
        description: 'Structuring complex portfolio assets for long-term clarity.'
      },
      {
        title: 'Cultural Research',
        description: 'Deep audience mapping and competitive differentiation.'
      },
      {
        title: 'Verbal Identity',
        description: 'Voice tone, brand taglines, and strategic editorial messaging.'
      }
    ]
  },
  {
    id: '03',
    navTitle: '03 / IMMERSIVE EXPRESSION',
    title: 'Immersive Digital Expression',
    description: 'We extend physical brand identities into living, dynamic digital spaces with high-performance web engineering and fluid motion physics.',
    bgColor: 'var(--midnight-harbor, #183165)',
    textColor: 'var(--sandy-reed, #D9D5B0)',
    descColor: '#FFFFFF', // High-contrast White for Midnight Harbor
    headingColor: '#183165', // Midnight Harbor heading
    subFields: [
      {
        title: 'Web Applications',
        description: 'Custom React & Vite frontend architectures built for speed.'
      },
      {
        title: 'Kinetic Motion',
        description: 'Smooth GSAP timelines, micro-interactions, and 3D effects.'
      },
      {
        title: 'UI Design Systems',
        description: 'Reusable component libraries and design tokens for web.'
      }
    ]
  }
];

const teamMembers = [
  {
    name: 'Ashan Perera',
    role: 'Co-Founder & Creative Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    instagram: 'https://instagram.com/ashanperera'
  },
  {
    name: 'Dineth Silva',
    role: 'Co-Founder & Strategy Lead',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    instagram: 'https://instagram.com/dinethsilva'
  },
  {
    name: 'Nimal Fernando',
    role: 'Co-Founder & Design Lead',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    instagram: 'https://instagram.com/nimalfernando'
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
        gsap.set(fill, {
          scaleY: 1 / listItems.length,
          transformOrigin: 'top left'
        });
      }

      listItems.forEach((item, i) => {
        const previousItem = listItems[i - 1];
        const headingColor = philosophiesData[i].headingColor;
        if (previousItem) {
          tl.set(item, { color: headingColor }, 0.5 * i)
            .to(
              slides[i],
              {
                autoAlpha: 1,
                duration: 0.25
              },
              '<'
            )
            .set(previousItem, { color: 'rgba(34, 34, 32, 0.4)' }, '<')
            .to(
              slides[i - 1],
              {
                autoAlpha: 0,
                duration: 0.25
              },
              '<'
            );
        } else {
          gsap.set(item, { color: headingColor });
          gsap.set(slides[i], { autoAlpha: 1 });
        }
      });

      tl.to(
        fill,
        {
          scaleY: 1,
          transformOrigin: 'top left',
          ease: 'none',
          duration: tl.duration()
        },
        0
      ).to({}, {});
    }, pinSection);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <span className="about-eyebrow">ABOUT PAPER HOOF</span>
          <h1 className="about-hero-title">
            WE CRAFT IDENTITIES THAT MOVE.
          </h1>
          <p className="about-hero-description">
            Paper Hoof is a Sri Lanka based branding and digital studio. We help visionary companies establish enduring visual authority through strategic direction, custom typography, and fluid interactive engineering.
          </p>
        </div>
      </section>

      {/* Pinned 3 Philosophies Section (Desktop View) */}
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

                {/* Sub-Field Cards Grid */}
                <div className="sub-fields-grid">
                  {p.subFields.map((field, idx) => (
                    <SubFieldCard
                      key={idx}
                      title={field.title}
                      description={field.description}
                      bgColor={p.bgColor}
                      textColor={p.textColor}
                      descColor={p.descColor}
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
              return (
                <div key={p.id} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-header-btn"
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    style={{
                      color: isOpen ? p.headingColor : 'rgba(32, 36, 35, 0.7)'
                    }}
                  >
                    <span className="accordion-header-title">{p.navTitle}</span>
                    <ChevronDown
                      size={22}
                      className={`accordion-chevron ${isOpen ? 'rotated' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="accordion-content-body">
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
                            bgColor={p.bgColor}
                            textColor={p.textColor}
                            descColor={p.descColor}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="team-img-wrapper">
                  <img src={member.image} alt={member.name} className="team-img" />
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-social-overlay"
                    aria-label={`${member.name} Instagram`}
                  >
                    <span>Instagram</span>
                    <ArrowUpRight size={18} />
                  </a>
                </div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-role">{member.role}</p>
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