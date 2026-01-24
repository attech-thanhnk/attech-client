import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import clientDocumentService from "../../../../services/clientDocumentService";
import { getApiUrl } from "../../../../config/apiConfig";
import "./Financial.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";

const FinancialReportRow = ({ item, t, onViewDocument }) => {
  const handleViewClick = async () => {
    await onViewDocument(item.slug);
  };

  return (
    <tr>
      <td>
        <div className="report-title">{item.title}</div>
        <div className="report-desc">{item.description}</div>
      </td>
      <td>
        <span className="report-date">{item.date}</span>
      </td>
      <td>
        <div className="report-actions">
          <button
            className="btn-view-v1"
            onClick={handleViewClick}
            style={{
              padding: "6px 16px",
              border: "none",
              background: "#1976d2",
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              marginRight: 8,
            }}
          >
            <i className="fa fa-eye" style={{ marginRight: 6 }}></i>
            Xem
          </button>
          <button
            className="btn-download-v1"
            onClick={handleViewClick}
            style={{
              padding: "6px 16px",
              border: "1px solid #1976d2",
              background: "#fff",
              color: "#1976d2",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <i className="fa fa-download" style={{ marginRight: 6 }}></i>
            Tải xuống
          </button>
        </div>
      </td>
    </tr>
  );
};

const Financial = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const [financialReports, setFinancialReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const seoContent = {
    vi: {
      title: "Thông tin tài chính | ATTECH",
      description:
        "Xem báo cáo tài chính và thông tin tài chính của ATTECH.",
      keywords:
        "thông tin tài chính ATTECH, báo cáo tài chính, financial reports",
    },
    en: {
      title: "Financial Information | ATTECH",
      description: "View financial reports and information of ATTECH.",
      keywords:
        "ATTECH financial information, financial reports, annual reports",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;

  const handleViewDocument = async (slug) => {
    try {
      const response = await clientDocumentService.getDocumentBySlug(slug);

      if (response.success && response.data) {
        // Handle multiple files
        if (response.data.documents && response.data.documents.length > 0) {
          if (response.data.documents.length === 1) {
            
            const file = response.data.documents[0];
            const fullUrl = getApiUrl(file.url);
            window.open(fullUrl, "_blank");
          } else {
            // Nhiều files → show modal cho user chọn
            setSelectedFiles(response.data.documents);
            setShowFileModal(true);
          }
        } else {
          alert(t("frontend.companyInfo.financial.noAttachment"));
        }
      } else {
        alert(t("frontend.companyInfo.financial.loadError"));
      }
    } catch (error) {
      alert(t("frontend.companyInfo.financial.errorLoading"));
    }
  };

  useEffect(() => {
    const fetchFinancialReports = async () => {
      try {
        setLoading(true);
        const response = await clientDocumentService.getDocuments({
          pageSize: 50,
          sortBy: "timePosted",
          sortDirection: "desc",
        });
        if (response.success && response.data && response.data.items) {
          const transformedReports = response.data.items.map((item) => ({
            id: item.id,
            title: currentLanguage === "vi" ? (item.titleVi || item.titleEn || item.title) : (item.titleEn || item.titleVi || item.title),
            description:
              currentLanguage === "vi" ? (item.descriptionVi || item.descriptionEn || item.description) : (item.descriptionEn || item.descriptionVi || item.description),
            date: item.timePosted
              ? new Date(item.timePosted).toLocaleDateString(currentLanguage === "vi" ? "vi-VN" : "en-US")
              : "",
            slug: currentLanguage === "vi" ? (item.slugVi || item.slugEn) : (item.slugEn || item.slugVi),
            file: null, // Will be loaded when user clicks view/download
          }));
          setFinancialReports(transformedReports);
        } else {
          setError(
            response.message || t("frontend.companyInfo.financial.loadReportsError")
          );
        }
      } catch (err) {
        setError(t("frontend.companyInfo.financial.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialReports();
  }, [currentLanguage, t]);

  if (loading) {
    return (
      <>
        <SEO
          title={currentSEO.title}
          description={currentSEO.description}
          keywords={currentSEO.keywords}
          url={location.pathname}
          lang={currentLanguage}
        />
        <div className="financial-page">
          <div className="financial-header">
            <i
              className="fa fa-bar-chart"
              style={{ fontSize: 32, color: "#1976d2", marginRight: 18 }}
            />
            <div>
              <h1>{t("frontend.companyInfo.financial.title")}</h1>
              <p className="financial-desc">
                {t("frontend.companyInfo.financial.description")}
              </p>
            </div>
          </div>
          <div
            className="financial-info"
            style={{ textAlign: "center", padding: 32 }}
          >
            <i
              className="fa fa-spinner fa-spin"
              style={{ fontSize: 24, color: "#1976d2" }}
            ></i>
            <p style={{ marginTop: 16, color: "#666" }}>{t("frontend.companyInfo.financial.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title={currentSEO.title}
          description={currentSEO.description}
          keywords={currentSEO.keywords}
          url={location.pathname}
          lang={currentLanguage}
        />
        <div className="financial-page">
          <div className="financial-header">
            <i
              className="fa fa-bar-chart"
              style={{ fontSize: 32, color: "#1976d2", marginRight: 18 }}
            />
            <div>
              <h1>{t("frontend.companyInfo.financial.title")}</h1>
              <p className="financial-desc">
                {t("frontend.companyInfo.financial.description")}
              </p>
            </div>
          </div>
          <div
            className="financial-info"
            style={{ textAlign: "center", padding: 32 }}
          >
            <i
              className="fa fa-exclamation-triangle"
              style={{ fontSize: 24, color: "#d32f2f" }}
            ></i>
            <p style={{ marginTop: 16, color: "#d32f2f" }}>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={
          currentLanguage === "vi"
            ? "/thong-tin-cong-ty/thong-tin-tai-chinh"
            : "/en/company/finance"
        }
        lang={currentLanguage}
      />
      <div className="financial-page">
        <div className="financial-header">
          <i
            className="fa fa-bar-chart"
            style={{ fontSize: 32, color: "#1976d2", marginRight: 18 }}
          />
          <div>
            <h1>{t("frontend.companyInfo.financial.title")}</h1>
            <p className="financial-desc">
              {t("frontend.companyInfo.financial.description")}
            </p>
          </div>
        </div>
        <div className="financial-info">
          <table className="financial-table">
            <thead>
              <tr>
                <th>
                  {t("frontend.companyInfo.financial.tableHeaders.title")}
                </th>
                <th>{t("frontend.companyInfo.financial.tableHeaders.date")}</th>
                <th>
                  {t("frontend.companyInfo.financial.tableHeaders.document")}
                </th>
              </tr>
            </thead>
            <tbody>
              {financialReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "center", color: "#888", padding: 32 }}
                  >
                    {t("frontend.companyInfo.financial.noReports")}
                  </td>
                </tr>
              ) : (
                financialReports.map((item, idx) => (
                  <FinancialReportRow
                    item={item}
                    key={idx}
                    t={t}
                    onViewDocument={handleViewDocument}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* File Selection Modal */}
        {showFileModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "24px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "70%",
                overflow: "auto",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>
                Chọn tài liệu để xem
              </h3>
              <div>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onClick={() => {
                      const fullUrl = getApiUrl(file.url);
                      window.open(fullUrl, "_blank");
                      setShowFileModal(false);
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        {file.originalFileName}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {file.contentType} • {(file.fileSize / 1024).toFixed(0)}{" "}
                        KB
                      </div>
                    </div>
                    <i
                      className="fa fa-external-link"
                      style={{ color: "#1976d2" }}
                    ></i>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  onClick={() => setShowFileModal(false)}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Financial;

