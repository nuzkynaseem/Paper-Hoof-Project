import React, { useState } from 'react';
import {
  Instagram,
  Music,
  MessageCircle,
  Linkedin,
  Mail,
  MapPin,
  ArrowUpRight,
  Copy,
  Check,
  Send,
  Sparkles
} from 'lucide-react';
import ReadyToMove from '../components/ReadyToMove';
import './ContactUs.css';

const socialChannels = [
  { name: 'Instagram', handle: '@paperhoof', url: 'https://instagram.com', icon: Instagram },
  { name: 'TikTok', handle: '@paperhoof', url: 'https://tiktok.com', icon: Music },
  { name: 'WhatsApp', handle: '+94 77 123 4567', url: 'https://whatsapp.com', icon: MessageCircle },
  { name: 'LinkedIn', handle: 'Paper Hoof Studio', url: 'https://linkedin.com', icon: Linkedin },
];

const serviceOptions = [
  'Brand Strategy',
  'Visual Identity',
  'Digital Experience',
  'Full Rebrand',
  'Brand Audit',
  'Other Inquiries'
];

const ContactUs = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedService, setSelectedService] = useState('Brand Identity');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('hello@paperhoof.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="contact-us-page">
      {/* Hero Title Section */}
      <section className="contact-title-hero">
        <div className="contact-container">
          <span className="contact-badge">GET IN TOUCH & CONNECT</span>
          <h1 className="contact-main-headline">SAY HELLO.</h1>
          <p className="contact-sub-headline">
            Whether you're exploring a rebrand, seeking strategic direction, or simply curious about working together, we're here to listen.
          </p>
        </div>
      </section>

      {/* Main 2-Column Section (JKR Global Style) */}
      <section className="contact-details-section">
        <div className="contact-container contact-grid">
          
          {/* Left Column: GET IN TOUCH (Replaces 'connect' on JKR) */}
          <div className="contact-column get-in-touch-column">
            <div className="column-header">
              <span className="column-num">01</span>
              <h2 className="column-title">GET IN TOUCH</h2>
            </div>

            <p className="column-intro">
              Direct inquiries, project briefs, or partnership proposals — send us a message directly or email our team.
            </p>

            <div className="email-card-box" onClick={handleCopyEmail}>
              <div className="email-icon-wrapper">
                <Mail size={22} />
              </div>
              <div className="email-text-details">
                <span className="email-label">DIRECT EMAIL</span>
                <a
                  href="mailto:hello@paperhoof.com"
                  onClick={(e) => e.stopPropagation()}
                  className="email-address-link"
                >
                  hello@paperhoof.com
                </a>
              </div>
              <button
                type="button"
                className="email-copy-action-btn"
                onClick={handleCopyEmail}
                title="Copy Email"
                aria-label="Copy Email Address"
              >
                {copiedEmail ? <Check size={18} className="text-green" /> : <Copy size={18} />}
              </button>
            </div>
            {copiedEmail && <span className="copy-toast-msg">Email copied to clipboard!</span>}

            <div className="location-info-card">
              <div className="location-icon-wrapper">
                <MapPin size={20} />
              </div>
              <div className="location-text-details">
                <span className="location-label">STUDIO LOCATION</span>
                <span className="location-value">Mawanella, Sri Lanka</span>
                <span className="location-sub">Global Remote Collaboration</span>
              </div>
            </div>

            <div className="response-guarantee-badge">
              <span className="dot-pulse" />
              <span>Response guaranteed within 24–48 hours</span>
            </div>
          </div>

          {/* Right Column: CONNECT (Replaces 'follow' on JKR) */}
          <div className="contact-column connect-column">
            <div className="column-header">
              <span className="column-num">02</span>
              <h2 className="column-title">CONNECT</h2>
            </div>

            <p className="column-intro">
              Follow our latest brand releases, behind-the-scenes craft, and editorial updates across our social channels.
            </p>

            <div className="social-channels-list">
              {socialChannels.map((channel, i) => {
                const IconComp = channel.icon;
                return (
                  <a
                    key={i}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-channel-card"
                    aria-label={`Connect on ${channel.name}`}
                  >
                    <div className="social-channel-left">
                      <div className="social-icon-wrapper">
                        <IconComp size={20} />
                      </div>
                      <div className="social-name-meta">
                        <span className="social-name">{channel.name}</span>
                        <span className="social-handle">{channel.handle}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={18} className="social-arrow-icon" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Direct Inquiry Form */}
      <section className="contact-form-section">
        <div className="contact-container">
          <div className="form-card-container">
            <div className="form-header">
              <span className="form-badge">START A PROJECT</span>
              <h2 className="form-title">SEND US A MESSAGE</h2>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="contact-inquiry-form">
                
                {/* Service Selection Pills */}
                <div className="form-group">
                  <label className="form-field-label">WHAT CAN WE HELP YOU WITH?</label>
                  <div className="service-pills-grid">
                    {serviceOptions.map((service, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`service-pill-btn ${selectedService === service ? 'active' : ''}`}
                        onClick={() => setSelectedService(service)}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-inputs-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-field-label">YOUR NAME *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-field-label">YOUR EMAIL *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-field-label">YOUR MESSAGE / PROJECT DETAILS *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Tell us about your brand goals, timeline, or questions..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="form-submit-btn">
                  <span>Send Message</span>
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="contact-success-screen">
                <div className="success-icon-badge">
                  <Sparkles size={32} />
                </div>
                <h3 className="success-title">Message Received!</h3>
                <p className="success-text">
                  Thank you for reaching out to Paper Hoof. Our strategy team has received your message and will get back to you via <strong>{formData.email}</strong> within 24–48 hours.
                </p>
                <button
                  type="button"
                  className="reset-form-btn"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ready to Move CTA band */}
      <ReadyToMove />
    </div>
  );
};

export default ContactUs;