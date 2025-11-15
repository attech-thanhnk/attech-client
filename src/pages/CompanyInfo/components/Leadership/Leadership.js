import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "../Leadership/Leadership.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";

export default function Leadership() {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const { getLeadershipImages } = useBannerSettings();
  const leaderImages = getLeadershipImages();

  const getLeadershipData = (t, images) => ({
    chairman: [
      {
        name: "Lê Tiến Thịnh",
        position: t("frontend.companyInfo.leadership.positions.chairman"),
        image: images.chairman || "/assets/images/leadership/thinhlt.webp",
      },
    ],
    director: [
      {
        name: "Nguyễn Hoàng Giang",
        position: t("frontend.companyInfo.leadership.positions.director"),
        image: images.director || "/assets/images/leadership/giangnh.webp",
      },
    ],
    viceDirectors: [
      {
        name: "Đinh Nhật Minh",
        position: t("frontend.companyInfo.leadership.positions.viceDirector"),
        image: images.viceDirector1 || "/assets/images/leadership/minhdn.webp",
      },
      {
        name: "Nguyễn Như Thành",
        position: t("frontend.companyInfo.leadership.positions.viceDirector"),
        image: images.viceDirector2 || "/assets/images/leadership/thanhnn.webp",
      },
      {
        name: "Phan Quốc Hưng",
        position: t("frontend.companyInfo.leadership.positions.viceDirector"),
        image: images.viceDirector3 || "/assets/images/leadership/hungpq.webp",
      },
    ],
  });

  const leadershipData = getLeadershipData(t, leaderImages);

  const seoContent = {
    vi: {
      title: "Ban lãnh đạo | ATTECH",
      description:
        "Giới thiệu ban lãnh đạo ATTECH gồm Chủ tịch Công ty, Giám đốc và các Phó giám đốc công ty kỹ thuật quản lý bay.",
      keywords:
        "ban lãnh đạo ATTECH, leadership, management team, giám đốc ATTECH",
    },
    en: {
      title: "Leadership | ATTECH",
      description:
        "Introducing ATTECH's leadership team including Chairman of the Board, Director and Deputy Directors of the air traffic technical company.",
      keywords: "ATTECH leadership, management team, company directors",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="leadership-background">
        <h2 className="leadership-title">
          {t("frontend.companyInfo.leadership.title")}
        </h2>
        <div className="leader-container">
          <div className="leader-section">
            <div className="leader-section-title"></div>
            <div className="leader-row leader-row-chairman">
              {leadershipData.chairman.map((member, idx) => (
                <div
                  className="leader-profile leader-profile-chairman"
                  key={idx}
                >
                  <div className="leader-img-wrap leader-img-wrap-chairman">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="leader-img"
                    />
                  </div>
                  <div className="leader-name leader-name-chairman">
                    {member.name}
                  </div>
                  <div className="leader-title leader-title-chairman">
                    {member.position}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="leader-section">
            <div className="leader-section-title"></div>
            <div className="leader-row leader-row-director">
              {leadershipData.director.map((member, idx) => (
                <div
                  className="leader-profile leader-profile-director"
                  key={idx}
                >
                  <div className="leader-img-wrap leader-img-wrap-director">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="leader-img"
                    />
                  </div>
                  <div className="leader-name leader-name-director">
                    {member.name}
                  </div>
                  <div className="leader-title leader-title-director">
                    {member.position}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="leader-section">
            <div className="leader-section-title"></div>
            <div className="leader-row leader-row-vice">
              {leadershipData.viceDirectors.map((member, idx) => (
                <div className="leader-profile leader-profile-vice" key={idx}>
                  <div className="leader-img-wrap leader-img-wrap-vice">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="leader-img"
                    />
                  </div>
                  <div className="leader-name leader-name-vice">
                    {member.name}
                  </div>
                  <div className="leader-title leader-title-vice">
                    {member.position}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
