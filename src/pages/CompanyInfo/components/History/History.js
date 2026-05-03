import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "./History.css";
import AOS from "aos";
import "aos/dist/aos.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";

const History = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const seoContent = {
    vi: {
      title: "Lịch sử ra đời",
      description:
        "Tìm hiểu về lịch sử hình thành và phát triển của ATTECH từ khi thành lập đến nay, những cột mốc quan trọng trong hành trình trở thành Công ty hàng đầu về thông tin - dẫn đường - giám sất trong ngành hàng không.",
      keywords:
        "lịch sử ATTECH, hành trình phát triển, company history, ATTECH timeline",
    },
    en: {
      title: "History",
      description:
        "Learn about ATTECH's formation and development, important milestones in becoming a leading aviation technology company.",
      keywords:
        "ATTECH history, company development, aviation history, ATTECH timeline",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const timelineData = [
    {
      year: "1986",
      title: t("frontend.companyInfo.history.timeline.1986.title"),
      description: t("frontend.companyInfo.history.timeline.1986.description"),
    },
    {
      year: "1991",
      title: t("frontend.companyInfo.history.timeline.1991.title"),
      description: t("frontend.companyInfo.history.timeline.1991.description"),
    },
    {
      year: "1998",
      title: t("frontend.companyInfo.history.timeline.1998.title"),
      description: t("frontend.companyInfo.history.timeline.1998.description"),
    },
    {
      year: "2008-2009",
      title: t("frontend.companyInfo.history.timeline.2008.title"),
      description: t("frontend.companyInfo.history.timeline.2008.description"),
    },
    {
      year: "2010",
      title: t("frontend.companyInfo.history.timeline.2010.title"),
      description: t("frontend.companyInfo.history.timeline.2010.description"),
    },
  ];

  const companyInfo = {
  name: {
    vietnamese: "Công ty TNHH Kỹ thuật Quản lý bay",
    international: "Air Traffic Technical Company Limited",
    short: "ATTECH CO.,LTD",
  },
  headquarters: {
    address: {
      vi: "Số 5/200 Đường Nguyễn Sơn, phường Bồ Đề, Thành phố Hà Nội",
      en: "No. 5/200 Nguyen Son Street, Bo De Ward, Hanoi City, Vietnam",
    },
    phone: "024.38271914",
    fax: "024.38730398",
    email: "attech@attech.com.vn",
    website: "attech.com.vn",
  },
  capital: {
    vi: "296.454.918.204 đồng",
    en: "296.454.918.204 VND",
  },
  branches: [
    {
      name: {
        vi: "Xí nghiệp chế tạo thiết bị Hàng không",
        en: "Aviation Equipment Manufacturing Enterprise",
      },
      address: {
        vi: "Tổ 1, Phường Long Biên, Thành phố Hà Nội",
        en: "Group 6, Long Bien Ward, Hanoi City, Vietnam",
      },
      phone: "024.38759625",
      fax: "024.38759625",
    },
    {
      name: {
        vi: "Chi nhánh tại thành phố Hồ Chí Minh",
        en: "Ho Chi Minh City Branch",
      },
      address: {
        vi: "58 Trường Sơn – Phường Tân Sơn Hòa – Thành phố Hồ Chí Minh",
        en: "58 Truong Son Street, Tan Son Hoa Ward, Ho Chi Minh City, Vietnam",
      },
      phone: "(84.28) 8456081",
      fax: "(84.28) 8456081",
    },
    {
      name: {
        vi: "Ban Quản lý dự án đầu tư và xây dựng chuyên ngành",
        en: "Specialized Investment and Construction Project Management Unit",
      },
      address: {
        vi: "Số 5/200 Đường Nguyễn Sơn, phường Bồ Đề, Thành phố Hà Nội",
        en: "No. 5/200 Nguyen Son Street, Bo De Ward, Hanoi City, Vietnam",
      },
      phone: "024.38723747",
      fax: "024.38759625",
      email: "attech-pmu@attech.com.vn",
    },
  ],
};

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="history-timeline">
        <section className="timeline-section">
          <div className="section-title" data-aos="fade-up">
            <h2>{t("frontend.companyInfo.history.title")}</h2>
          </div>
          <div className="timeline">
            {timelineData.map((event, index) => (
              <div
                key={index}
                className={`timeline-item ${
                  index % 2 === 0 ? "left" : "right"
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{event.year}</div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="company-info-section">
          <div className="section-title" data-aos="fade-up">
            <h2>{t("frontend.companyInfo.history.companyInfoTitle")}</h2>
          </div>
          <div className="company-info-grid">
            <div className="info-card" data-aos="fade-up">
              <h3>{t("frontend.companyInfo.history.companyName")}</h3>
              <p>
                <strong>{t("frontend.companyInfo.history.vietnamese")}:</strong>{" "}
                {companyInfo.name.vietnamese}
              </p>
              <p>
                <strong>
                  {t("frontend.companyInfo.history.international")}:
                </strong>{" "}
                {companyInfo.name.international}
              </p>
              <p>
                <strong>
                  {t("frontend.companyInfo.history.abbreviation")}:
                </strong>{" "}
                {companyInfo.name.short}
              </p>
            </div>
            <div className="info-card" data-aos="fade-up" data-aos-delay="100">
              <h3>{t("frontend.companyInfo.history.headquarters")}</h3>
              <p>
                <strong>{t("frontend.companyInfo.history.address")}:</strong>{" "}
                {companyInfo.headquarters.address[currentLanguage]}
              </p>
              <p>
                <strong>{t("frontend.companyInfo.history.phone")}:</strong>{" "}
                {companyInfo.headquarters.phone}
              </p>
              <p>
                <strong>{t("frontend.companyInfo.history.fax")}:</strong>{" "}
                {companyInfo.headquarters.fax}
              </p>
              <p>
                <strong>{t("frontend.companyInfo.history.email")}:</strong>{" "}
                {companyInfo.headquarters.email}
              </p>
              <p>
                <strong>{t("frontend.companyInfo.history.website")}:</strong>{" "}
                <a
                  href={`https://${companyInfo.headquarters.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {companyInfo.headquarters.website}
                </a>
              </p>
            </div>
            <div className="info-card" data-aos="fade-up" data-aos-delay="200">
              <h3>{t("frontend.companyInfo.history.capital")}</h3>
              {companyInfo.capital[currentLanguage]}
            </div>
          </div>
          <div className="branches-section" data-aos="fade-up">
            <h3>{t("frontend.companyInfo.history.otherFacilities")}</h3>
            <div className="branches-grid">
              {companyInfo.branches.map((branch, index) => (
                <div key={index} className="branch-card">
                  <h4>{branch.name[currentLanguage]}</h4>
                  <p>
                    <strong>
                      {t("frontend.companyInfo.history.address")}:
                    </strong>{" "}
                    {branch.address[currentLanguage]}
                  </p>
                  <p>
                    <strong>{t("frontend.companyInfo.history.phone")}:</strong>{" "}
                    {branch.phone}
                  </p>
                  <p>
                    <strong>{t("frontend.companyInfo.history.fax")}:</strong>{" "}
                    {branch.fax}
                  </p>
                  {branch.email && (
                    <p>
                      <strong>
                        {t("frontend.companyInfo.history.email")}:
                      </strong>{" "}
                      {branch.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default History;
