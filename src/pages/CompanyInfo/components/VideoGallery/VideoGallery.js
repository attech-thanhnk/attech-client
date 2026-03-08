import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import videoService from "../../../../services/videoService";
import "./VideoGallery.css";

const VideoGallery = () => {
  const location = useLocation();
  const { currentLanguage } = useI18n();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const config = {
    vi: {
      seo: {
        title: "Thư viện video | ATTECH",
        description: "Xem các video giới thiệu và hoạt động của ATTECH.",
        keywords: "video ATTECH, giới thiệu công ty, hoạt động",
      },
      title: "Thư viện video",
      description: "Xem các video giới thiệu, hoạt động và sự kiện của công ty",
      noVideos: "Chưa có video nào",
      loading: "Đang tải...",
      close: "Đóng",
    },
    en: {
      seo: {
        title: "Video Gallery | ATTECH",
        description: "Watch ATTECH's introduction and activity videos.",
        keywords: "ATTECH videos, company introduction, activities",
      },
      title: "Video Gallery",
      description: "Watch company introduction, activities and event videos",
      noVideos: "No videos available",
      loading: "Loading...",
      close: "Close",
    },
  };

  const currentConfig = config[currentLanguage] || config.vi;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await videoService.fetchClientVideos({
          pageNumber: 1,
          pageSize: 50,
        });

        if (response.success) {
          const videoData = response.data || [];
          // Filter only active videos (status = 1) and sort by order
          const formattedVideos = videoData
            .filter((video) => video.status === 1)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((video) => ({
              id: video.id,
              title:
                currentLanguage === "vi"
                  ? video.titleVi || video.titleEn
                  : video.titleEn || video.titleVi,
              description:
                currentLanguage === "vi"
                  ? video.descriptionVi || video.descriptionEn
                  : video.descriptionEn || video.descriptionVi,
              youtubeId: video.youtubeId,
              thumbnail:
                video.thumbnail ||
                `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`,
              date: video.createdDate,
            }));
          setVideos(formattedVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        // API not available yet - show empty state instead of error
        console.log("Video API not available yet");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentLanguage]);

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <SEO
        title={currentConfig.seo.title}
        description={currentConfig.seo.description}
        keywords={currentConfig.seo.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="video-gallery-page">
        <div className="video-gallery-header">
          <div>
            <h1>{currentConfig.title}</h1>
            <p className="video-gallery-desc">{currentConfig.description}</p>
          </div>
        </div>

        {loading ? (
          <div className="video-gallery-loading">
            <i className="fa fa-spinner fa-spin"></i>
            <p>{currentConfig.loading}</p>
          </div>
        ) : error ? (
          <div className="video-gallery-error">
            <i className="fa fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="video-gallery-empty">
            <i className="fa fa-video-camera"></i>
            <p>{currentConfig.noVideos}</p>
          </div>
        ) : (
          <div className="video-gallery-grid">
            {videos.map((video) => (
              <div
                key={video.id}
                className="video-card"
                onClick={() => openVideo(video)}
              >
                <div className="video-thumbnail">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                  />
                  <div className="video-play-btn">
                    <i className="fa fa-play"></i>
                  </div>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  {video.date && (
                    <span className="video-date">
                      {new Date(video.date).toLocaleDateString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div className="video-modal" onClick={closeVideo}>
            <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="video-modal-close" onClick={closeVideo}>
                <i className="fa fa-times"></i>
              </button>
              <div className="video-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-modal-info">
                <h3>{selectedVideo.title}</h3>
                {selectedVideo.description && <p>{selectedVideo.description}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoGallery;
