import React, { useEffect, useRef } from 'react';
import { Instagram, Music, MessageCircle, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer" ref={footerRef} data-testid="site-footer">
      <div className="footer-main">
        <div className="footer-container">
          {/* Left — large black horse */}
          <div className="footer-col footer-col-left reveal-col">
            <img
              src={`${process.env.PUBLIC_URL}/paperhoof-horse.svg`}
              alt="Paper Hoof"
              className="footer-horse"
            />
          </div>

          <div className="footer-divider-vertical"></div>

          {/* Middle — stacked wordmark */}
          <div className="footer-col footer-col-middle reveal-col">
            <h2 className="footer-wordmark">Paper<br />Hoof</h2>
          </div>

          <div className="footer-divider-vertical"></div>

          {/* Right — contact */}
          <div className="footer-col footer-col-right reveal-col">
            <div className="footer-contact-section">
              <h3 className="footer-contact-heading">Get in Touch</h3>
              <div className="footer-social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                  <Instagram size={22} />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="TikTok">
                  <Music size={22} />
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="WhatsApp">
                  <MessageCircle size={22} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                  <Linkedin size={22} />
                </a>
              </div>
            </div>

            <div className="footer-contact-section">
              <h3 className="footer-contact-heading">Contact Us</h3>
              <a href="mailto:hello@paperhoof.com" className="footer-contact-link">hello@paperhoof.com</a>
            </div>

            <div className="footer-contact-section">
              <h3 className="footer-contact-heading">Location</h3>
              <p className="footer-contact-text">Mawanella, Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
