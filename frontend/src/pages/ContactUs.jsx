import React from 'react';
import { Instagram, Music, MessageCircle, Linkedin, Mail, MapPin } from 'lucide-react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contact-us-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">Contact Us</h1>
            <div className="hero-contact-details">
              <div className="contact-detail-item">
                <Mail size={20} className="contact-icon" />
                <a href="mailto:branfern@gmail.com" className="contact-link">
                  branfern@gmail.com
                </a>
              </div>
              <div className="contact-detail-item">
                <MapPin size={20} className="contact-icon" />
                <span className="contact-text">Mawanella, Sri Lanka</span>
              </div>
            </div>
            <p className="hero-description">
              Whether you're exploring a rebrand, seeking strategic direction, or simply curious about working together, we're here to listen. Reach out and let's start the conversation.
            </p>
          </div>
          <div className="hero-right">
            <div className="hero-social-section">
              <h3 className="social-heading">Follow Us</h3>
              <div className="hero-social-links">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hero-social-link">
                  <Instagram size={24} />
                  <span>Instagram</span>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hero-social-link">
                  <Music size={24} />
                  <span>TikTok</span>
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="hero-social-link">
                  <MessageCircle size={24} />
                  <span>WhatsApp</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hero-social-link">
                  <Linkedin size={24} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section with Marquee */}
      <section className="contact-main">
        <div className="marquee-container">
          <div className="marquee">
            <span className="marquee-text">Ready to move with us • Ready to move with us • Ready to move with us • Ready to move with us • Ready to move with us • Ready to move with us • </span>
            <span className="marquee-text">Ready to move with us • Ready to move with us • Ready to move with us • Ready to move with us • Ready to move with us • Ready to move with us • </span>
          </div>
        </div>

        <div className="cta-container">
          <a href="/brand-review" className="contact-cta-button">
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;