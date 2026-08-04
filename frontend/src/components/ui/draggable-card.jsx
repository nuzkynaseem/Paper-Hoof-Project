import React, { createContext, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const DraggableContext = createContext(null);

export const DraggableCardContainer = ({ children, className }) => {
  const containerRef = useRef(null);

  return (
    <DraggableContext.Provider value={containerRef}>
      <div
        ref={containerRef}
        className={cn(
          "relative flex min-h-[480px] md:min-h-[650px] w-full max-w-full items-center justify-center overflow-hidden md:overflow-visible",
          className
        )}
      >
        {children}
      </div>
    </DraggableContext.Provider>
  );
};

export const DraggableCardBody = ({ children, className, ...props }) => {
  const containerRef = useContext(DraggableContext);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.12}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      whileHover={{ scale: 1.04, zIndex: 40 }}
      whileDrag={{ scale: 1.06, zIndex: 50, cursor: "grabbing" }}
      className={cn(
        "absolute cursor-grab rounded-2xl border border-black/10 bg-white/95 p-2 sm:p-4 shadow-xl backdrop-blur-md transition-shadow hover:shadow-2xl select-none max-w-[108px] xs:max-w-[120px] sm:max-w-[200px] md:max-w-[240px]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
