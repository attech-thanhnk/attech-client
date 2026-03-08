import React, { useState, useEffect } from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isLoading }) => {
  const [visible, setVisible] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading && visible) {
      // Start fade out animation
      setFadeOut(true);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setVisible(false);
        setFadeOut(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (isLoading) {
      setVisible(true);
      setFadeOut(false);
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="modern-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-dots">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;