import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 0.45], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], isMobile ? [0.92, 1] : [0.94, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.45], [40, 0]);

  return (
    <div
      ref={containerRef}
      className="cs-container"
      style={{ perspective: '1000px' }}
    >
      <div className="cs-layout">
        <motion.div style={{ translateY }} className="cs-title-wrapper">
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX: isMobile ? 0 : rotate,
            scale,
            transformOrigin: 'top center'
          }}
          className="cs-card-wrapper"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default ContainerScroll;
