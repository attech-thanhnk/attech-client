import React, { useState, useEffect } from "react";
import "./Carousel.css";

import useIsMobile from "../Header/Navbar/useIsMobile";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";

const Carousel = () => {
  // Pre-calculate responsive values to prevent re-render
  const [isMobile] = useState(window.innerWidth <= 1025);
  const [isSmallMobile] = useState(window.innerWidth <= 600);
  const { getCarouselImages, loading } = useBannerSettings();

  // Get slides from banner settings with fallback to default images
  // Dùng ảnh mobile khi màn hình <= 768px
  const slides = getCarouselImages(window.innerWidth <= 768);

  useEffect(() => {
    // Initialize carousel
    const carouselElement = document.querySelector("#carouselId");
    if (carouselElement) {
      const carousel = new window.bootstrap.Carousel(carouselElement, {
        interval: 5000,
        wrap: true,
        keyboard: true,
        pause: "hover",
        ride: "carousel",
      });
    }
  }, []);

  // Remove inline marginTop - use CSS only
  const carouselStyle = {
    transition: "none",
    animation: "none",
  };

  // Bỏ skeleton vì đã có fallback, carousel luôn có ít nhất 1 ảnh

  return (
    <div className="carousel-wrapper" style={carouselStyle}>
      <div
        id="carouselId"
        className="carousel slide w-100"
        data-bs-ride="carousel"
        data-bs-pause="hover"
        data-bs-interval="5000"
        style={{ width: "100%" }}
      >
        <div className="carousel-inner" role="listbox">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img
                src={slide.img}
                className={`img-fluid w-100 ${slide.className}`}
                alt={`Slide ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
