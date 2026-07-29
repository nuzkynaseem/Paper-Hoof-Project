import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './ReadyToMove.css';

const ReadyToMove = ({
  buttonText = "Give a brand review",
  buttonLink = "/brand-review"
}) => {
  const navigate = useNavigate();

  const phrase = (
    <span className="rb-phrase">
      <span className="w-mint">READY</span>{' '}
      <span className="w-bubblegum">TO</span>{' '}
      <span className="w-golden">MOVE</span>{' '}
      <span className="w-sandy">WITH</span>{' '}
      <span className="w-olive">US</span>
      <span className="w-cream">?</span>&nbsp;&nbsp;•&nbsp;&nbsp;
    </span>
  );

  return (
    <section className="ready-band" data-testid="ready-to-move">
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
