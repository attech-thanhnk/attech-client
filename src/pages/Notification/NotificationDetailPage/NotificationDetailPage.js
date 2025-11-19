import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import sanitizeHtml from "sanitize-html";
import "./NotificationDetailPage.css";
import {
  getNotificationBySlug,
  getNotificationCategories,
  getRelatedNotifications,
  formatNotificationForDisplay,
} from "../../../services/clientNotificationService";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";
import { getLanguageFromPath } from "../../../utils/routeHelpers";
import { getApiBaseUrl } from "../../../config/apiConfig";
import LocalizedLink from "../../../components/Shared/LocalizedLink";
import SearchBox from "../../../components/Shared/SearchBox";
import ErrorPage from "../../../components/Shared/ErrorPage";
import { useLocation } from "react-router-dom";

const NotificationDetailPage = () => {
  const { currentLanguage } = useI18n();
  const { t: tNotifications } = useTranslation();

  // Helper functions for attachments
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeDisplay = (contentType) => {
    if (!contentType) return "Unknown";
    if (contentType.includes("pdf")) return "PDF";
    if (contentType.includes("word")) return "Word";
    if (contentType.includes("excel") || contentType.includes("spreadsheet"))
      return "Excel";
    if (
      contentType.includes("powerpoint") ||
      contentType.includes("presentation")
    )
      return "PowerPoint";
    if (contentType.includes("image")) return "Image";
    if (contentType.includes("text")) return "Text";
    return contentType.split("/")[1]?.toUpperCase() || "File";
  };
  const location = useLocation();
  const { slug: notificationSlug } = useParams();
  const isEnglish = getLanguageFromPath(location.pathname) === "en";
  const navigate = useNavigate();
  const [notificationItem, setNotificationItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedNotifications, setRelatedNotifications] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllImages, setShowAllImages] = useState(false);

  // Handle search
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleSearch = useCallback(
    (term) => {
      if (term.trim()) {
        // Navigate to notification list page with search
        const url =
          currentLanguage === "vi"
            ? `/thong-bao?search=${encodeURIComponent(term)}`
            : `/en/notifications?search=${encodeURIComponent(term)}`;
        navigate(url);
      }
    },
    [navigate, currentLanguage]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion) => {
      // Navigate directly to the selected notification
      const category = categories.find(
        (cat) => cat.id === suggestion.notificationCategoryId
      );
      const categorySlug =
        currentLanguage === "vi" ? category?.slugVi : category?.slugEn;

      if (categorySlug && suggestion.slug) {
        const url =
          currentLanguage === "vi"
            ? `/thong-bao/${suggestion.slug}.html`
            : `/en/notifications/${suggestion.slug}.html`;
        navigate(url);
      }
    },
    [navigate, currentLanguage, categories]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load categories and notification data in parallel
        const [categoriesData, notificationData] = await Promise.all([
          getNotificationCategories(),
          getNotificationBySlug(notificationSlug, isEnglish ? "en" : "vi"),
        ]);

        setCategories(categoriesData);
        setNotificationItem(notificationData);

        // Load related notifications
        const related = await getRelatedNotifications(
          notificationData.id,
          notificationData.notificationCategoryId,
          5
        );
        setRelatedNotifications(related);

        setError(null);
      } catch (err) {setError("Error loading notification");
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadData();
  }, [notificationSlug, isEnglish]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "vi" ? "vi-VN" : "en-GB",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // Helper functions to get localized content
  const getTitle = () =>
    isEnglish ? notificationItem?.titleEn : notificationItem?.titleVi;
  const getDescription = () =>
    isEnglish
      ? notificationItem?.descriptionEn
      : notificationItem?.descriptionVi;
  const getContent = () => {
    const formattedItem = formatNotificationForDisplay(
      notificationItem,
      isEnglish ? "en" : "vi"
    );
    return formattedItem?.content;
  };
  const getCategoryName = () => {
    if (!notificationItem?.notificationCategoryId) return "";
    const category = categories.find(
      (cat) => cat.id === notificationItem.notificationCategoryId
    );
    return isEnglish ? category?.titleEn : category?.titleVi;
  };

  const getCategorySlug = () => {
    if (!notificationItem?.notificationCategoryId) return "";
    const category = categories.find(
      (cat) => cat.id === notificationItem.notificationCategoryId
    );
    return isEnglish ? category?.slugEn : category?.slugVi;
  };

  if (!isInitialized || loading) {
    return (
      <div className="notification-detail-page">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notificationItem) {
    return (
      <ErrorPage
        title="Thông báo không tồn tại"
        message="Xin lỗi, thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        suggestions={[
          "Kiểm tra lại đường link",
          "Tìm kiếm thông báo khác",
          "Quay lại trang danh sách thông báo",
        ]}
        type="notification"
        backRoute="HOME"
        backText="Về trang chủ"
        listRoute="NOTIFICATIONS"
        listText="Xem tất cả thông báo"
      />
    );
  }

  return (
    <>
      <SEO
        title={getTitle()}
        description={getDescription() || getTitle()}
        keywords={`${getTitle()}, ${getCategoryName()}, ATTECH, thông báo`}
        image={formatNotificationForDisplay(notificationItem, currentLanguage)?.imageUrl}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        locale={currentLanguage === 'en' ? 'en_US' : 'vi_VN'}
        type="article"
      />
      <div className="notification-detail-page">
        <div className="notification-detail-layout">
          {/* Sidebar */}
          <aside className="notification-sidebar">
            {/* Search Box */}
            <div className="sidebar-search">
              <h3>{tNotifications("frontend.notifications.searchNotifications")}</h3>
              <SearchBox
                value={searchTerm}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onSelectSuggestion={handleSelectSuggestion}
                placeholder={tNotifications("frontend.notifications.searchNotifications")}
                style={{ minWidth: "100%", fontSize: 14 }}
              />
            </div>

            <h3>Thông báo liên quan</h3>
            <ul>
              {relatedNotifications.length > 0 ? (
                relatedNotifications.map((n) => {
                  const formattedItem = formatNotificationForDisplay(
                    n,
                    currentLanguage
                  );
                  const category = categories.find(
                    (cat) => cat.id === n.notificationCategoryId
                  );
                  const categorySlug =
                    currentLanguage === "vi"
                      ? category?.slugVi
                      : category?.slugEn;

                  return (
                    <li key={n.id}>
                      <Link
                        to={
                          currentLanguage === "vi"
                            ? `/thong-bao/${formattedItem.slug}.html`
                            : `/en/notifications/${formattedItem.slug}.html`
                        }
                        className={
                          n.id === notificationItem?.id ? "active" : ""
                        }
                      >
                        {formattedItem.title}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="no-results">Không có thông báo liên quan</li>
              )}
            </ul>
          </aside>

          {/* Main content */}
          <div className="notification-detail-container">
            {/* Breadcrumb */}
            <nav className="breadcrumb-nav">
              <LocalizedLink routeKey="HOME">Trang chủ</LocalizedLink> &gt;{" "}
              <LocalizedLink routeKey="NOTIFICATIONS">Thông báo</LocalizedLink>{" "}
              &gt;{" "}
              <LocalizedLink
                to={
                  currentLanguage === "vi"
                    ? `/thong-bao/${getCategorySlug()}`
                    : `/en/notifications/${getCategorySlug()}`
                }
              >
                {getCategoryName()}
              </LocalizedLink>{" "}
              &gt; <span>{getTitle()}</span>
            </nav>

            {/* Article Header */}
            <article className="notification-article">
              <header className="article-header">
                <h1 className="article-title">{getTitle()}</h1>
                <div className="article-meta">
                  <span className="article-date">
                    <i className="bi bi-calendar"></i>
                    {formatDate(notificationItem.timePosted)}
                  </span>
                  <span className="article-category">
                    <i className="bi bi-tag"></i>
                    <LocalizedLink
                      to={
                        currentLanguage === "vi"
                          ? `/thong-bao/${getCategorySlug()}`
                          : `/en/notifications/${getCategorySlug()}`
                      }
                    >
                      {getCategoryName()}
                    </LocalizedLink>
                  </span>
                </div>
              </header>

              {/* Article Image */}
              {(() => {
                const formattedItem = formatNotificationForDisplay(
                  notificationItem,
                  currentLanguage
                );
                return (
                  formattedItem?.imageUrl && (
                    <div className="article-image">
                      <img
                        src={formattedItem.imageUrl}
                        alt={getTitle()}
                        title={getTitle()}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )
                );
              })()}

              {/* Article Description */}
              {getDescription() && (
                <div className="article-description">
                  <p>{getDescription()}</p>
                </div>
              )}

              {/* Article Content */}
              <div className="article-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(getContent(), {
                      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                        "img",
                        "figure",
                        "figcaption",
                      ]),
                      allowedAttributes: {
                        ...sanitizeHtml.defaults.allowedAttributes,
                        img: [
                          "src",
                          "alt",
                          "title",
                          "class",
                          "width",
                          "height",
                          "loading",
                        ],
                        figure: ["class"],
                        figcaption: ["class"],
                        div: ["style", "class"],
                        p: ["style", "class", "align"],
                        span: ["style", "class"],
                        table: ["style", "class", "border", "width"],
                        tr: ["style", "class"],
                        td: ["style", "class"],
                        th: ["style", "class"],
                        a: ["href", "target", "rel"],
                      },
                      allowedStyles: {
                        "*": {
                          color: [
                            /^\#(0x)?[0-9a-f]+$/i,
                            /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
                          ],
                          "text-align": [
                            /^left$/,
                            /^right$/,
                            /^center$/,
                            /^justify$/,
                          ],
                          "font-size": [/^\d+(?:px|em|%)$/],
                          "font-weight": [
                            /^(?:normal|bold|bolder|lighter|[1-9]00)$/,
                          ],
                          "background-color": [
                            /^\#(0x)?[0-9a-f]+$/i,
                            /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
                          ],
                          margin: [/^\d+(?:px|em|%)$/, /^auto$/],
                          "margin-left": [/^\d+(?:px|em|%)$/, /^auto$/],
                          "margin-right": [/^\d+(?:px|em|%)$/, /^auto$/],
                          padding: [/^\d+(?:px|em|%)$/],
                          width: [/^\d+(?:px|em|%)$/],
                          height: [/^\d+(?:px|em|%)$/],
                          display: [
                            /^block$/,
                            /^inline$/,
                            /^inline-block$/,
                            /^none$/,
                          ],
                        },
                      },
                    }),
                  }}
                />
              </div>

              {/* Attachments Section */}
              {notificationItem?.attachments && (
                <div className="article-attachments">
                  {/* Image Attachments */}
                  {notificationItem.attachments.images &&
                    notificationItem.attachments.images.length > 0 && (
                      <div className="attachments-section">
                        <h3 className="attachments-title">
                          <i className="bi bi-images"></i>
                          Hình ảnh đính kèm
                        </h3>
                        <div className="attachments-gallery">
                          {(showAllImages
                            ? notificationItem.attachments.images
                            : notificationItem.attachments.images.slice(0, 6)
                          ).map((img, index) => (
                            <div
                              key={img.id || index}
                              className="attachment-item image-item"
                            >
                              <img
                                src={
                                  img.url?.startsWith("http")
                                    ? img.url
                                    : `${getApiBaseUrl()}${img.url}`
                                }
                                alt={
                                  img.originalFileName || `Image ${index + 1}`
                                }
                                className="attachment-image"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                        {notificationItem.attachments.images.length > 6 && (
                          <div className="show-more-images">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setShowAllImages(!showAllImages)}
                            >
                              <i
                                className={`bi bi-${
                                  showAllImages ? "chevron-up" : "images"
                                }`}
                              ></i>
                              {showAllImages
                                ? "Ẩn bớt ảnh"
                                : `Xem thêm ${
                                    notificationItem.attachments.images.length -
                                    6
                                  } ảnh`}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Document Attachments */}
                  {notificationItem.attachments.documents &&
                    notificationItem.attachments.documents.length > 0 && (
                      <div className="attachments-section">
                        <h3 className="attachments-title">
                          <i className="bi bi-paperclip"></i>
                          Tài liệu đính kèm
                        </h3>
                        <div className="attachments-list">
                          {notificationItem.attachments.documents.map(
                            (doc, index) => (
                              <div
                                key={doc.id || index}
                                className="attachment-item document-item clickable"
                                onClick={() => {
                                  const url = doc.url?.startsWith("http")
                                    ? doc.url
                                    : `${process.env.REACT_APP_API_URL}${doc.url}`;
                                  window.open(
                                    url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                }}
                                style={{ cursor: "pointer" }}
                                title="Click để xem tài liệu"
                              >
                                <div className="attachment-icon">
                                  {doc.contentType?.includes("pdf") ? (
                                    <i className="bi bi-file-pdf text-danger"></i>
                                  ) : doc.contentType?.includes("word") ? (
                                    <i className="bi bi-file-word text-primary"></i>
                                  ) : doc.contentType?.includes("excel") ? (
                                    <i className="bi bi-file-excel text-success"></i>
                                  ) : (
                                    <i className="bi bi-file-text"></i>
                                  )}
                                </div>
                                <div className="attachment-info">
                                  <h4 className="attachment-name">
                                    {doc.originalFileName ||
                                      doc.fileName ||
                                      "Document"}
                                  </h4>
                                  <div className="attachment-meta">
                                    <span className="attachment-size">
                                      {doc.fileSize
                                        ? formatFileSize(doc.fileSize)
                                        : "N/A"}
                                    </span>
                                    <span className="attachment-type">
                                      {getFileTypeDisplay(doc.contentType)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Article Footer */}
              <footer className="article-footer">
                <div className="article-tags">
                  <span className="tag-label">Danh mục:</span>
                  <LocalizedLink
                    to={
                      currentLanguage === "vi"
                        ? `/thong-bao/${getCategorySlug()}`
                        : `/en/notifications/${getCategorySlug()}`
                    }
                    className="tag"
                  >
                    {getCategoryName()}
                  </LocalizedLink>
                </div>
                <div className="article-navigation">
                  <LocalizedLink routeKey="NOTIFICATIONS" className="back-link">
                    <i className="bi bi-arrow-left"></i>
                    Quay lại danh sách thông báo
                  </LocalizedLink>
                </div>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(NotificationDetailPage);
