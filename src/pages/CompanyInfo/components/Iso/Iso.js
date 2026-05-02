import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Download, Award, Shield, CheckCircle2 } from "lucide-react";
import "./Iso.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import isoDocumentService from "../../../../services/isoDocumentService";
import { getApiUrl } from "../../../../config/apiConfig";

const Iso = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const seoContent = {
    vi: {
      title: "Hệ thống chứng chỉ ISO",
      description:
        "Tìm hiểu về hệ thống quản lý chất lượng ISO 9001:2015, ISO 14001:2015 và các chứng chỉ chất lượng của ATTECH.",
      keywords:
        "ISO ATTECH, ISO 9001, ISO 14001, chứng chỉ chất lượng, quality management",
    },
    en: {
      title: "ISO Certification System",
      description:
        "Learn about ATTECH's quality management system ISO 9001:2015, ISO 14001:2015 and quality certifications.",
      keywords:
        "ATTECH ISO, ISO 9001, ISO 14001, quality certification, quality management system",
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

  // Load ISO documents from API
  useEffect(() => {
    const loadIsoDocuments = async () => {
      try {
        setLoadingDocuments(true);
        const result = await isoDocumentService.getPublishedIsoDocuments();

        if (result.success && result.data) {
          // Map API data to component format
          const mappedDocs = result.data.map((doc) => {
            const firstAttachment = doc.attachments && doc.attachments.length > 0
              ? doc.attachments[0]
              : null;

            return {
              name: currentLanguage === "en" && doc.titleEn ? doc.titleEn : doc.titleVi,
              size: firstAttachment
                ? `${Math.round(firstAttachment.fileSize / 1024)} KB`
                : "N/A",
              link: firstAttachment ? getApiUrl(firstAttachment.url) : "#",
              year: doc.certificateYear,
              description: currentLanguage === "en" && doc.descriptionEn
                ? doc.descriptionEn
                : doc.descriptionVi,
            };
          });

          setDocuments(mappedDocs);
        }
      } catch (error) {
        console.error("Error loading ISO documents:", error);
        // Fallback to empty array on error
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadIsoDocuments();
  }, [currentLanguage]);

  const timelineData = [
    {
      year: "2005",
      description: t("frontend.companyInfo.iso.timeline.2005"),
      icon: <Award className="timeline-icon" />,
    },
    {
      year: "2008",
      description: t("frontend.companyInfo.iso.timeline.2008"),
      icon: <Shield className="timeline-icon" />,
    },
    {
      year: "2011",
      description: t("frontend.companyInfo.iso.timeline.2011"),
      icon: <CheckCircle2 className="timeline-icon" />,
    },
    {
      year: "2018",
      description: t("frontend.companyInfo.iso.timeline.2018"),
      icon: <Shield className="timeline-icon" />,
    },
    {
      year: t("frontend.companyInfo.iso.timeline.present"),
      description: t("frontend.companyInfo.iso.timeline.2020"),
      icon: <Award className="timeline-icon" />,
    },
  ];

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="quality-management">
        <section className="intro-section">
          <div className="section-title" data-aos="fade-up">
            <h2>{t("frontend.companyInfo.iso.introTitle")}</h2>
          </div>
          <div
            className="intro-content"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <p>{t("frontend.companyInfo.iso.introDescription")}</p>
          </div>
        </section>

        <section className="timeline-section">
          <div className="section-title" data-aos="fade-up">
            <h2>{t("frontend.companyInfo.iso.historyTitle")}</h2>
          </div>
          <div className="timeline">
            {timelineData.map((event, index) => (
              <div
                key={index}
                className={`timeline-item ${
                  index % 2 === 0 ? "left" : "right"
                }`}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 100}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{event.year}</div>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="commitment-section">
          <div className="section-title" data-aos="fade-up">
            <h2>{t("frontend.companyInfo.iso.commitmentTitle")}</h2>
          </div>
          <div
            className="commitment-content"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <p>{t("frontend.companyInfo.iso.commitmentParagraph1")}</p>
            <p>{t("frontend.companyInfo.iso.commitmentParagraph2")}</p>
            <p>{t("frontend.companyInfo.iso.commitmentParagraph3")}</p>

            <p>{t("frontend.companyInfo.iso.commitmentParagraph4")}</p>
          </div>
        </section>

        <section className="documents-section">
          <div className="section-title" data-aos="fade-up">
            <h2>{t("frontend.companyInfo.iso.documentsTitle")}</h2>
          </div>
          <div
            className="documents-list"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {loadingDocuments ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">
                  {currentLanguage === "en" ? "Loading documents..." : "Đang tải tài liệu..."}
                </p>
              </div>
            ) : documents.length > 0 ? (
              documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.link}
                  className="document-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <span className="doc-name">{doc.name}</span>
                  <Download className="download-icon" />
                  <span className="file-size">({doc.size})</span>
                </a>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">
                  {currentLanguage === "en"
                    ? "No documents available at the moment."
                    : "Hiện chưa có tài liệu nào."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Iso;
