import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "../Leadership/Leadership.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Leadership() {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const { getLeadershipImages } = useBannerSettings();
  const leaderImages = getLeadershipImages();
  const [contentHtml, setContentHtml] = useState("");

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

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // Load content from translation (managed via admin)
  useEffect(() => {
    const translationContent = t("frontend.companyInfo.leadership.fullContent", {
      returnObjects: true,
      defaultValue: "",
    });

    if (translationContent && typeof translationContent === "string") {
      try {
        // Try to parse as JSON first (structured data from admin)
        const parsedData = JSON.parse(translationContent);
        setContentHtml(parsedData);
      } catch (e) {
        // If not JSON, treat as HTML string
        setContentHtml(translationContent);
      }
    }
  }, [t, currentLanguage]);

  // Check if content is structured JSON data or HTML string
  const isStructuredData = contentHtml && typeof contentHtml === "object";
  const useTranslationContent = contentHtml && (typeof contentHtml === "string" ? contentHtml.trim() !== "" : true);

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
        {useTranslationContent ? (
          isStructuredData ? (
            // Render structured JSON data from admin
            <>
              <h2 className="leadership-title">
                {t("frontend.companyInfo.leadership.title")}
              </h2>
              <div className="leader-container">
                {/* Chairman */}
                {contentHtml.chairman && contentHtml.chairman.name && (
                  <div className="leader-section">
                    <div className="leader-section-title"></div>
                    <div className="leader-row leader-row-chairman">
                      <div className="leader-profile leader-profile-chairman">
                        <div className="leader-img-wrap leader-img-wrap-chairman">
                          <img
                            src={leaderImages.chairman || "/assets/images/leadership/thinhlt.webp"}
                            alt={contentHtml.chairman.name}
                            className="leader-img"
                          />
                        </div>
                        <div className="leader-name leader-name-chairman">
                          {contentHtml.chairman.name}
                        </div>
                        <div className="leader-title leader-title-chairman">
                          {t("frontend.companyInfo.leadership.positions.chairman")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Director */}
                {contentHtml.director && contentHtml.director.name && (
                  <div className="leader-section">
                    <div className="leader-section-title"></div>
                    <div className="leader-row leader-row-director">
                      <div className="leader-profile leader-profile-director">
                        <div className="leader-img-wrap leader-img-wrap-director">
                          <img
                            src={leaderImages.director || "/assets/images/leadership/giangnh.webp"}
                            alt={contentHtml.director.name}
                            className="leader-img"
                          />
                        </div>
                        <div className="leader-name leader-name-director">
                          {contentHtml.director.name}
                        </div>
                        <div className="leader-title leader-title-director">
                          {t("frontend.companyInfo.leadership.positions.director")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vice Directors */}
                {contentHtml.viceDirectors && contentHtml.viceDirectors.length > 0 && (
                  <div className="leader-section">
                    <div className="leader-section-title"></div>
                    <div className="leader-row leader-row-vice">
                      {contentHtml.viceDirectors.map((viceDir, idx) => (
                        viceDir.name && (
                          <div className="leader-profile leader-profile-vice" key={idx}>
                            <div className="leader-img-wrap leader-img-wrap-vice">
                              <img
                                src={leaderImages[`viceDirector${idx + 1}`] || ["/assets/images/leadership/hungpq.webp", "/assets/images/leadership/thanhnn.webp", "/assets/images/leadership/minhdn.webp"][idx]}
                                alt={viceDir.name}
                                className="leader-img"
                              />
                            </div>
                            <div className="leader-name leader-name-vice">
                              {viceDir.name}
                            </div>
                            <div className="leader-title leader-title-vice">
                              {t("frontend.companyInfo.leadership.positions.viceDirector")}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Render HTML content from admin
            <div
              className="managed-content"
              data-aos="fade-up"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )
        ) : (
          // Fallback to hardcoded content (legacy)
          <>
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
          </>
        )}
      </div>
    </>
  );
}
