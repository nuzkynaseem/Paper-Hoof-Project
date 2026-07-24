import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './ReadyToMove.css';

const ReadyToMove = () => {
  const navigate = useNavigate();

  const phrase = (
    <span className="rb-phrase">
      READY <span className="rb-orange">TO</span> MOVE <span className="rb-yellow">WITH</span> US&nbsp;&nbsp;•&nbsp;&nbsp;
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
          onClick={() => navigate('/brand-review')}
          data-testid="ready-contact-btn"
        >
          Contact Us <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default ReadyToMove;
