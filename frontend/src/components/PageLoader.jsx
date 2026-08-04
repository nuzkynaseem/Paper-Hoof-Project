import React, { useEffect, useState } from 'react';
import './PageLoader.css';

const PageLoader = ({ isLoading: externalIsLoading }) => {
  const [internalLoading, setInternalLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const activeLoading = externalIsLoading !== undefined ? externalIsLoading : internalLoading;

  useEffect(() => {
    // Initial load progress animation
    let startTime = null;
    let animationFrame = null;
    const duration = 1200; // 1.2s smooth loader

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const calculatedProgress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(calculatedProgress);

      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(animateProgress);
      } else {
        setTimeout(() => {
          setInternalLoading(false);
        }, 150);
      }
    };

    animationFrame = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (!activeLoading && progress >= 100) {
    return null;
  }

  return (
    <div
      className={`page-loader-overlay ${!activeLoading && progress >= 100 ? 'loader-hidden' : ''}`}
      aria-label="Loading page"
      role="status"
    >
      <div className="page-loader-content">
        {/* Paper Hoof Logo */}
        <div className="loader-logo-wrapper">
          <img
            src={`${process.env.PUBLIC_URL}/paperhoof-wordmark.svg`}
            alt="Paper Hoof Studio"
            className="loader-wordmark-img"
          />
        </div>

        {/* Progress Bar & Percentage Track */}
        <div className="loader-progress-track">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loader-percentage">
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
