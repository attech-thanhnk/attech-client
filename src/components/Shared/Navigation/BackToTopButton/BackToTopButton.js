import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./BackToTopButton.css";

const BackToTopButton = ({
  scrollThreshold = 300,
  size = 40,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
      duration: 500
    });
  };

  if (!isVisible) return null;

  return (
    <button
      className="back-to-top"
      onClick={scrollToTop}
      style={{ width: size, height: size }}
      aria-label="Cuộn lên đầu trang"
      title="Cuộn lên đầu trang"
    >
      <i className="fas fa-chevron-up"></i>
    </button>
  );
};

BackToTopButton.propTypes = {
  scrollThreshold: PropTypes.number,
  size: PropTypes.number,
};

export default BackToTopButton;
