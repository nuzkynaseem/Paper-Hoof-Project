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
} from 'lucide-react';
import ReadyToMove from '../components/ReadyToMove';
import './ContactUs.css';

const socialChannels = [
  { name: 'Instagram', handle: '@paperhoof', url: 'https://instagram.com', icon: Instagram },
  { name: 'TikTok', handle: '@paperhoof', url: 'https://tiktok.com', icon: Music },
  { name: 'WhatsApp', handle: '+94 77 123 4567', url: 'https://whatsapp.com', icon: MessageCircle },
  { name: 'LinkedIn', handle: 'Paper Hoof Studio', url: 'https://linkedin.com', icon: Linkedin },
];

const ContactUs = () => {
  const [activeTab, setActiveTab] = useState('get-in-touch'); // 'get-in-touch' | 'connect'
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('hello@paperhoof.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
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

      {/* Main Interactive Hover Section */}
      <section className="contact-interactive-section">
        <div className="contact-container contact-split-grid">
          
          {/* Left Column: Two Main Nav Titles (Get in touch & Connect) */}
          <div className="contact-nav-titles-col">
            <button
              type="button"
              className={`contact-nav-title-btn ${activeTab === 'get-in-touch' ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab('get-in-touch')}
              onClick={() => setActiveTab('get-in-touch')}
            >
              <span className="title-num">01</span>
              <span className="title-text">Get in touch</span>
              <span className="active-dot-indicator" />
            </button>

            <button
              type="button"
              className={`contact-nav-title-btn ${activeTab === 'connect' ? 'active' : ''}`}
              onMouseEnter={() => setActiveTab('connect')}
              onClick={() => setActiveTab('connect')}
            >
              <span className="title-num">02</span>
              <span className="title-text">Connect</span>
              <span className="active-dot-indicator" />
            </button>
          </div>

          {/* Right Column: Dynamic Content Details on Hover */}
          <div className="contact-details-display-col">
            
            {activeTab === 'get-in-touch' ? (
              <div className="tab-pane get-in-touch-pane">
                <p className="pane-intro">
                  Direct inquiries, project briefs, or partnership proposals — send us an email or reach out to our studio directly.
                </p>

                {/* Email Card Box with copy to clipboard */}
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

                {/* Studio Location */}
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
            ) : (
              <div className="tab-pane connect-pane">
                <p className="pane-intro">
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