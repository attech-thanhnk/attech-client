import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import clientDocumentService from "../../../../services/clientDocumentService";
import { getApiUrl } from "../../../../config/apiConfig";
import "./Financial.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";

const DocumentRow = ({ item, t, onViewDocument }) => {
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
            {t("frontend.companyInfo.financial.view")}
          </button>
          <button
            className="btn-download-v1"
            onClick={handleViewClick}
            style={{
              padding: "6px",
              border: "1px solid #1976d2",
              background: "#fff",
              color: "#1976d2",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <i className="fa fa-download" style={{ marginRight: 6 }}></i>
            {t("frontend.companyInfo.financial.download")}
          </button>
        </div>
      </td>
    </tr>
  );
};

// documentType: "financial" | "other"
const Financial = ({ documentType = "financial" }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Config based on documentType
  const config = {
    financial: {
      seo: {
        vi: {
          title: "Thông tin tài chính",
          description: "Xem báo cáo tài chính và thông tin tài chính của Công ty TNHH Kỹ thuật Quản lý bay.",
          keywords: "thông tin tài chính ATTECH, báo cáo tài chính, financial reports",
        },
        en: {
          title: "Financial Information",
          description: "View financial reports and information of ATTECH.",
          keywords: "ATTECH financial information, financial reports, annual reports",
        },
      },
      icon: "fa-bar-chart",
      title: { vi: "Thông tin tài chính", en: "Financial Information" },
      desc: { vi: "Báo cáo tài chính và thông tin liên quan", en: "Financial reports and related information" },
      noData: { vi: "Chưa có báo cáo tài chính", en: "No financial reports available" },
      url: {
        vi: "/thong-tin-cong-ty/thong-tin-tai-chinh",
        en: "/en/company/financial",
      },
      fetchService: clientDocumentService.getFinancialDocuments,
    },
    other: {
      seo: {
        vi: {
          title: "Thông tin khác",
          description: "Xem các thông tin và tài liệu khác của.",
          keywords: "thông tin khác ATTECH, tài liệu, documents",
        },
        en: {
          title: "Other Information",
          description: "View other information and documents.",
          keywords: "ATTECH other information, documents",
        },
      },
      icon: "fa-file-text",
      title: { vi: "Thông tin khác", en: "Other Information" },
      desc: { vi: "Các thông tin và tài liệu khác", en: "View other information and documents" },
      noData: { vi: "Chưa có tài liệu", en: "No documents available" },
      url: {
        vi: "/thong-tin-cong-ty/thong-tin-khac",
        en: "/en/company/other-info",
      },
      fetchService: clientDocumentService.getOtherDocuments,
    },
  };

  const currentConfig = config[documentType] || config.financial;
  const currentSEO = currentConfig.seo[currentLanguage] || currentConfig.seo.vi;

  // Reset to page 1 and clear documents when language or documentType changes
  useEffect(() => {
    setCurrentPage(1);
    setDocuments([]);
    setHasMore(false);
  }, [currentLanguage, documentType]);

  const handleViewDocument = async (slug) => {
    try {
      const response = await clientDocumentService.getDocumentBySlug(slug);

      if (response.success && response.data) {
        if (response.data.documents && response.data.documents.length > 0) {
          if (response.data.documents.length === 1) {
            const file = response.data.documents[0];
            const fullUrl = getApiUrl(file.url);
            // Create a temporary link and click it to avoid popup blocker on mobile
            const link = document.createElement('a');
            link.href = fullUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
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
    const fetchDocuments = async () => {
      try {
        const isFirstPage = currentPage === 1;
        if (isFirstPage) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await currentConfig.fetchService({
          page: currentPage,
          pageSize: pageSize,
        });

        if (response.success && response.data && response.data.items) {
          const transformedDocs = response.data.items.map((item) => ({
            id: item.id,
            title: currentLanguage === "vi"
              ? (item.titleVi || item.titleEn || item.title)
              : (item.titleEn || item.titleVi || item.title),
            description: currentLanguage === "vi"
              ? (item.descriptionVi || item.descriptionEn || item.description)
              : (item.descriptionEn || item.descriptionVi || item.description),
            date: item.timePosted
              ? new Date(item.timePosted).toLocaleDateString(currentLanguage === "vi" ? "vi-VN" : "en-US")
              : "",
            slug: currentLanguage === "vi"
              ? (item.slugVi || item.slugEn)
              : (item.slugEn || item.slugVi),
          }));

          // Append new items instead of replacing
          if (isFirstPage) {
            setDocuments(transformedDocs);
          } else {
            setDocuments(prev => [...prev, ...transformedDocs]);
          }

          setTotalItems(response.data.totalItems || 0);
          const totalLoaded = currentPage * pageSize;
          setHasMore(totalLoaded < (response.data.totalItems || 0));
        } else {
          setError(response.message || t("frontend.companyInfo.financial.loadError"));
        }
      } catch (err) {
        setError(t("frontend.companyInfo.financial.errorLoading"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchDocuments();
  }, [currentLanguage, documentType, currentPage]);

  const renderHeader = () => (
    <div className="financial-header">
      <div>
        <h1>{currentConfig.title[currentLanguage] || currentConfig.title.vi}</h1>
        <p className="financial-desc">{currentConfig.desc[currentLanguage] || currentConfig.desc.vi}</p>
      </div>
    </div>
  );

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
          {renderHeader()}
          <div className="financial-info" style={{ textAlign: "center", padding: 32 }}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize: 24, color: "#1976d2" }}></i>
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
          {renderHeader()}
          <div className="financial-info" style={{ textAlign: "center", padding: 32 }}>
            <i className="fa fa-exclamation-triangle" style={{ fontSize: 24, color: "#d32f2f" }}></i>
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
        url={currentConfig.url[currentLanguage] || currentConfig.url.vi}
        lang={currentLanguage}
      />
      <div className="financial-page">
        {renderHeader()}
        <div className="financial-info">
          <table className="financial-table">
            <thead>
              <tr>
                <th>{t("frontend.companyInfo.financial.tableHeaders.title")}</th>
                <th>{t("frontend.companyInfo.financial.tableHeaders.date")}</th>
                <th>{t("frontend.companyInfo.financial.tableHeaders.document")}</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#888", padding: 32 }}>
                    {currentConfig.noData[currentLanguage] || currentConfig.noData.vi}
                  </td>
                </tr>
              ) : (
                documents.map((item, idx) => (
                  <DocumentRow
                    item={item}
                    key={idx}
                    t={t}
                    onViewDocument={handleViewDocument}
                  />
                ))
              )}
            </tbody>
          </table>

          {/* Load More */}
          {hasMore && (
            <div className="financial-load-more-wrap">
              <button
                className="financial-load-more-btn"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i>
                    {currentLanguage === "vi" ? "Đang tải..." : "Loading..."}
                  </>
                ) : (
                  <>
                    <i className="fa fa-angle-down"></i>
                    {currentLanguage === "vi" ? "Xem thêm" : "Load More"}
                  </>
                )}
              </button>
            </div>
          )}
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
                {t("frontend.companyInfo.financial.selectFile")}
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
                      // Create a temporary link and click it to avoid popup blocker on mobile
                      const link = document.createElement('a');
                      link.href = fullUrl;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setShowFileModal(false);
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        {file.originalFileName}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {file.contentType} • {(file.fileSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <i className="fa fa-external-link" style={{ color: "#1976d2" }}></i>
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
                  {t("frontend.companyInfo.financial.close")}
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
