import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './ReadyToMove.css';

const ReadyToMove = ({
  buttonText = "Give a brand review",
  buttonLink = "/brand-review",
  bgColor = "var(--mint-sprig, #97D9AF)"
}) => {
  const navigate = useNavigate();

  const phrase = (
    <span className="rb-phrase">
      READY <span className="rb-orange">TO</span> MOVE <span className="rb-navy">WITH</span> US<span className="rb-cream-question">?</span>&nbsp;&nbsp;•&nbsp;&nbsp;
    </span>
  );

  return (
    <section
      className="ready-band"
      style={{ backgroundColor: bgColor }}
      data-testid="ready-to-move"
    >
      <div className="ready-band-marquee">
        <div className="ready-band-track">
          {phrase}{phrase}{phrase}{phrase}
        </div>
      </div>
      <div className="ready-band-cta">
        <button
          className="ready-contact-btn"
          onClick={() => navigate(buttonLink)}
          data-testid="ready-contact-btn"
        >
          <span>{buttonText}</span> <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default ReadyToMove;
