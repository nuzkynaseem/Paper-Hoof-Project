import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
  const [activeCarousel, setActiveCarousel] = useState({
    digital: 0,
    physical: 0,
    human: 0
  });

  const digitalCards = [
    { title: 'Brand Strategy', description: 'Deep research and positioning that defines your market presence' },
    { title: 'Visual Systems', description: 'Cohesive design systems that scale across all touchpoints' },
    { title: 'Digital Architecture', description: 'Strategic digital frameworks built for growth' }
  ];

  const physicalCards = [
    { title: 'Print Collateral', description: 'Editorial-grade materials that command attention' },
    { title: 'Packaging Design', description: 'Tactile experiences that tell your brand story' },
    { title: 'Environmental Graphics', description: 'Spatial design that brings brands into the real world' }
  ];

  const humanCards = [
    { title: 'Brand Voice', description: 'Language systems that resonate with your audience' },
    { title: 'Customer Experience', description: 'Thoughtful journeys from first touch to loyalty' },
    { title: 'Team Alignment', description: 'Internal culture that embodies your brand values' }
  ];

  const teamMembers = [
    {
      name: 'Ashan Perera',
      role: 'Co-Founder & Creative Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      instagram: 'https://instagram.com/ashanperera'
    },
    {
      name: 'Dineth Silva',
      role: 'Co-Founder & Strategy Lead',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      instagram: 'https://instagram.com/dinethsilva'
    },
    {
      name: 'Nimal Fernando',
      role: 'Co-Founder & Design Lead',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
      instagram: 'https://instagram.com/nimalfernando'
    }
  ];

  const handleCarouselNext = (pillar) => {
    const cards = pillar === 'digital' ? digitalCards : pillar === 'physical' ? physicalCards : humanCards;
    setActiveCarousel(prev => ({
      ...prev,
      [pillar]: (prev[pillar] + 1) % cards.length
    }));
  };

  const handleCarouselPrev = (pillar) => {
    const cards = pillar === 'digital' ? digitalCards : pillar === 'physical' ? physicalCards : humanCards;
    setActiveCarousel(prev => ({
      ...prev,
      [pillar]: (prev[pillar] - 1 + cards.length) % cards.length
    }));
  };

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-container">
          <div className="hero-left">
            <span className="hero-eyebrow">About Branfern</span>
            <h1 className="hero-title">We design the systems that power your brand.</h1>
          </div>
          <div className="hero-right">
            <div className="hero-about-display">
              <span className="about-text">ABOUT US</span>
            </div>
          </div>
        </div>
      </section>

      {/* Showreel Section */}
      <section className="showreel-section">
        <div className="showreel-container">
          <div className="showreel-frame">
            <div className="showreel-content">
              <span className="showreel-placeholder">BRANFERN SHOWREEL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-container">
          <span className="section-eyebrow">Our Philosophy</span>
          <h2 className="section-heading">Brand as Action</h2>
          <p className="philosophy-description">
            We believe a brand is not what you say, but what you do. It's the cumulative experience of every interaction, every product, every conversation. Our work is rooted in systems thinking: building frameworks that scale, evolve, and remain coherent across digital, physical, and human touchpoints.
          </p>
        </div>
      </section>

      {/* Digital Pillar */}
      <section className="pillar-section">
        <div className="pillar-divider"></div>
        <div className="pillar-container">
          <div className="pillar-content">
            <div className="pillar-left">
              <h3 className="pillar-label">01</h3>
              <h2 className="pillar-heading">Digital</h2>
            </div>
            <div className="pillar-right">
              <p className="pillar-description">
                Digital presence is more than websites and apps. It's the architecture of how your brand exists online, how it communicates, how it serves your audience. We design digital systems that are intuitive, scalable, and grounded in human behavior.
              </p>
            </div>
          </div>
          
          <div className="pillar-showreel">
            <img 
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=220&fit=crop" 
              alt="Digital design" 
              className="pillar-image"
            />
          </div>

          <div className="pillar-carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${activeCarousel.digital * 100}%)` }}>
              {digitalCards.map((card, index) => (
                <div key={index} className="carousel-card">
                  <span className="card-bullet">•</span>
                  <h4 className="card-title">{card.title}</h4>
                  <p className="card-description">{card.description}</p>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button onClick={() => handleCarouselPrev('digital')} className="carousel-btn">
                <ChevronLeft size={20} />
              </button>
              <div className="carousel-dots">
                {digitalCards.map((_, index) => (
                  <span key={index} className={`dot ${activeCarousel.digital === index ? 'active' : ''}`}></span>
                ))}
              </div>
              <button onClick={() => handleCarouselNext('digital')} className="carousel-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Pillar */}
      <section className="pillar-section">
        <div className="pillar-divider"></div>
        <div className="pillar-container">
          <div className="pillar-content">
            <div className="pillar-left">
              <h3 className="pillar-label">02</h3>
              <h2 className="pillar-heading">Physical</h2>
            </div>
            <div className="pillar-right">
              <p className="pillar-description">
                Physical touchpoints matter. They're tactile, memorable, and permanent. From packaging to print collateral, we craft materials that feel considered, premium, and aligned with your brand's values. Every detail counts.
              </p>
            </div>
          </div>
          
          <div className="pillar-showreel">
            <img 
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1400&h=220&fit=crop" 
              alt="Physical design" 
              className="pillar-image"
            />
          </div>

          <div className="pillar-carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${activeCarousel.physical * 100}%)` }}>
              {physicalCards.map((card, index) => (
                <div key={index} className="carousel-card">
                  <span className="card-bullet">•</span>
                  <h4 className="card-title">{card.title}</h4>
                  <p className="card-description">{card.description}</p>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button onClick={() => handleCarouselPrev('physical')} className="carousel-btn">
                <ChevronLeft size={20} />
              </button>
              <div className="carousel-dots">
                {physicalCards.map((_, index) => (
                  <span key={index} className={`dot ${activeCarousel.physical === index ? 'active' : ''}`}></span>
                ))}
              </div>
              <button onClick={() => handleCarouselNext('physical')} className="carousel-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Human Pillar */}
      <section className="pillar-section">
        <div className="pillar-divider"></div>
        <div className="pillar-container">
          <div className="pillar-content">
            <div className="pillar-left">
              <h3 className="pillar-label">03</h3>
              <h2 className="pillar-heading">Human</h2>
            </div>
            <div className="pillar-right">
              <p className="pillar-description">
                Behind every brand are people. Your team, your customers, your community. We design systems that consider human behavior, language, and culture. Because brands that understand people build lasting relationships.
              </p>
            </div>
          </div>
          
          <div className="pillar-showreel">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&h=220&fit=crop" 
              alt="Human centered design" 
              className="pillar-image"
            />
          </div>

          <div className="pillar-carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${activeCarousel.human * 100}%)` }}>
              {humanCards.map((card, index) => (
                <div key={index} className="carousel-card">
                  <span className="card-bullet">•</span>
                  <h4 className="card-title">{card.title}</h4>
                  <p className="card-description">{card.description}</p>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button onClick={() => handleCarouselPrev('human')} className="carousel-btn">
                <ChevronLeft size={20} />
              </button>
              <div className="carousel-dots">
                {humanCards.map((_, index) => (
                  <span key={index} className={`dot ${activeCarousel.human === index ? 'active' : ''}`}></span>
                ))}
              </div>
              <button onClick={() => handleCarouselNext('human')} className="carousel-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-container">
          <span className="section-eyebrow">The Team</span>
          <h2 className="section-heading">The Branfern Collective</h2>
          <p className="team-description">
            We're a small, considered team of designers, strategists, and makers based in Sri Lanka. We work with brands that value thoughtful design and are committed to building something meaningful.
          </p>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="team-image-container">
                  <img src={member.image} alt={member.name} className="team-image" />
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="team-overlay">
                    <span>Instagram</span>
                    <ArrowUpRight size={20} />
                  </a>
                </div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Move Section */}
      <section className="ready-section">
        <div className="ready-marquee-container">
          <div className="ready-marquee">
            <span className="ready-marquee-text">READY TO MOVE WITH US • READY TO MOVE WITH US • READY TO MOVE WITH US • READY TO MOVE WITH US • </span>
            <span className="ready-marquee-text">READY TO MOVE WITH US • READY TO MOVE WITH US • READY TO MOVE WITH US • READY TO MOVE WITH US • </span>
          </div>
        </div>
        <div className="ready-cta">
          <a href="/contact" className="ready-button">Contact Us</a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;