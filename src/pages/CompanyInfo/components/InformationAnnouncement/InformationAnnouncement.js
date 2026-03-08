import React from "react";
import { Link, useLocation } from "react-router-dom";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import "./InformationAnnouncement.css";

const InformationAnnouncement = () => {
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const config = {
    vi: {
      seo: {
        title: "Thông tin công bố | ATTECH",
        description: "Xem các thông tin công bố của ATTECH bao gồm thông tin tài chính và thông tin khác.",
        keywords: "thông tin công bố ATTECH, thông tin tài chính, tài liệu",
      },
      title: "Thông tin công bố",
      description: "Xem các thông tin và tài liệu công bố của công ty",
      cards: [
        {
          title: "Thông tin tài chính",
          description: "Xem các báo cáo tài chính, kết quả kinh doanh và thông tin tài chính khác",
          icon: "fa-bar-chart",
          link: "/thong-tin-cong-ty/thong-tin-tai-chinh",
        },
        {
          title: "Thông tin khác",
          description: "Xem các thông tin và tài liệu khác của công ty",
          icon: "fa-file-text",
          link: "/thong-tin-cong-ty/thong-tin-khac",
        },
      ],
    },
    en: {
      seo: {
        title: "Information Announcement | ATTECH",
        description: "View ATTECH's information announcements including financial information and other documents.",
        keywords: "ATTECH information announcement, financial information, documents",
      },
      title: "Information Announcement",
      description: "View company's published information and documents",
      cards: [
        {
          title: "Financial Information",
          description: "View financial reports, business results and other financial information",
          icon: "fa-bar-chart",
          link: "/en/company/financial",
        },
        {
          title: "Other Information",
          description: "View other company information and documents",
          icon: "fa-file-text",
          link: "/en/company/other-info",
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
      <div className="information-announcement-page">
        <div className="information-announcement-header">
          <div>
            <h1>{currentConfig.title}</h1>
            <p className="information-announcement-desc">{currentConfig.description}</p>
          </div>
        </div>

        <div className="information-announcement-cards">
          {currentConfig.cards.map((card, index) => (
            <Link to={card.link} key={index} className="info-card">
              <div className="info-card-icon">
                <i className={`fa ${card.icon}`}></i>
              </div>
              <div className="info-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="info-card-arrow">
                <i className="fa fa-chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default InformationAnnouncement;
