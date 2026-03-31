import React from "react";
import { Link, useLocation } from "react-router-dom";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import "./MediaLibrary.css";

const MediaLibrary = () => {
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const config = {
    vi: {
      seo: {
        title: "Thư viện Công ty | ATTECH",
        description: "Xem thư viện ảnh và video của ATTECH.",
        keywords: "thư viện ATTECH, hình ảnh, video, gallery",
      },
      title: "Thư viện Công ty",
      description: "Khám phá hình ảnh và video hoạt động của Công ty",
      cards: [
        {
          title: "Thư viện ảnh",
          description: "Xem các album hình ảnh hoạt động, sự kiện và dự án của Công ty",
          icon: "fa-image",
          link: "/thong-tin-cong-ty/thu-vien-anh",
        },
        {
          title: "Thư viện video",
          description: "Xem các video giới thiệu, hoạt động và sự kiện của Công ty",
          icon: "fa-play-circle",
          link: "/thong-tin-cong-ty/thu-vien-video",
        },
      ],
    },
    en: {
      seo: {
        title: "Company Media Library | ATTECH",
        description: "View ATTECH's photo and video library.",
        keywords: "ATTECH library, photos, videos, gallery",
      },
      title: "Company Media Library",
      description: "Explore company's photos and videos",
      cards: [
        {
          title: "Photo Gallery",
          description: "View photo albums of company activities, events and projects",
          icon: "fa-image",
          link: "/en/company/photos",
        },
        {
          title: "Video Gallery",
          description: "Watch company introduction, activities and event videos",
          icon: "fa-play-circle",
          link: "/en/company/videos",
        },
      ],
    },
  };

  const currentConfig = config[currentLanguage] || config.vi;

  return (
    <>
      <SEO
        title={currentConfig.seo.title}
        description={currentConfig.seo.description}
        keywords={currentConfig.seo.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="media-library-page">
        <div className="media-library-header">
          <div>
            <h1>{currentConfig.title}</h1>
            <p className="media-library-desc">{currentConfig.description}</p>
          </div>
        </div>

        <div className="media-library-cards">
          {currentConfig.cards.map((card, index) => (
            <Link to={card.link} key={index} className="media-card">
              <div className="media-card-icon">
                <i className={`fa ${card.icon}`}></i>
              </div>
              <div className="media-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="media-card-arrow">
                <i className="fa fa-chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MediaLibrary;
