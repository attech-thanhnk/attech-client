import React, { useEffect, useState } from "react";
import "./Media.css";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";

const rotatingWords = ["An toàn", "Điều hòa", "Hiệu quả"];

const Media = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVideo1Playing, setIsVideo1Playing] = useState(false);
  const [isVideo2Playing, setIsVideo2Playing] = useState(false);
  const { getHomeHeroBackground } = useBannerSettings();
  const heroBackground = getHomeHeroBackground();

  // Rotate words one at a time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handle click to play video
  const handleVideoClick = (videoNumber) => {
    if (videoNumber === 1) {
      setIsVideo1Playing(true);
    } else {
      setIsVideo2Playing(true);
    }
  };

  return (
    <section
      className="hero-section"
      id="section_1"
      style={{
        backgroundImage: `url(${heroBackground || 'assets/images/media_bg/media_bg_1.webp'})`
      }}
    >
      <div className="section-overlay"></div>

      

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <div className="ratio ratio-16x9 animate-fade-in video-wrapper">
                  {!isVideo1Playing && (
                    <div
                      className="video-overlay"
                      onClick={() => handleVideoClick(1)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleVideoClick(1);
                        }
                      }}
                    >
                      <img
                        src="https://img.youtube.com/vi/bROog4Jqyzo/maxresdefault.jpg"
                        alt="Sự kiện bóng đá 26/03/2025 - Video 1"
                        className="custom-image"
                        loading="lazy"
                      />
                      <div className="play-button"></div>
                    </div>
                  )}
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/bROog4Jqyzo?si=RT7niLf9saPsCGHF${
                      isVideo1Playing ? "&autoplay=1" : ""
                    }`}
                    title="YouTube video player 1"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className={isVideo1Playing ? "" : "hidden"}
                  ></iframe>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="ratio ratio-16x9 animate-fade-in video-wrapper">
                  {!isVideo2Playing && (
                    <div
                      className="video-overlay"
                      onClick={() => handleVideoClick(2)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleVideoClick(2);
                        }
                      }}
                    >
                      <img
                        src="https://img.youtube.com/vi/szACf6q5SoM/maxresdefault.jpg"
                        alt="Sự kiện bóng đá 26/03/2025 - Video 2"
                        className="custom-image"
                        loading="lazy"
                      />
                      <div className="play-button"></div>
                    </div>
                  )}
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/szACf6q5SoM?si=WWRz3pdNfG-9KCSB${
                      isVideo2Playing ? "&autoplay=1" : ""
                    }`}
                    title="YouTube video player 2"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className={isVideo2Playing ? "" : "hidden"}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Media;