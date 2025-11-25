import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ViewAllButton from "../../../../components/ViewAllButton/ViewAllButton";
import { useI18n } from "../../../../hooks/useI18n";
import { formatNotificationForDisplay } from "../../../../services/clientNotificationService";
import "./NotificationSection.css";

const NotificationSection = ({ title, notifications, type }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Helper functions for multilingual support
  const getTitle = (notification) =>
    currentLanguage === "vi" ? notification.titleVi : notification.titleEn;
  const getCategorySlug = (notification) =>
    currentLanguage === "vi"
      ? notification.notificationCategorySlugVi
      : notification.notificationCategorySlugEn;
  const getSlug = (notification) =>
    currentLanguage === "vi" ? notification.slugVi : notification.slugEn;

  // Lấy slug category từ notification đầu tiên (nếu có)
  const categorySlug = currentNotifications[0]
    ? getCategorySlug(currentNotifications[0])
    : type;

  // Debug logging// Early return if no notifications
  if (!notifications || notifications.length === 0) {
    return (
      <div className="notification-section">
        <div className="section-tittle-flex">
          <h3>{title}</h3>
        </div>
        <div className="no-notifications">
          <p>Không có thông báo nào trong danh mục này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-section">
      <div className="section-tittle-flex">
        <h3>{title}</h3>
        <ViewAllButton
          to={
            currentLanguage === "vi"
              ? `/thong-bao/${categorySlug}`
              : `/en/notifications/${categorySlug}`
          }
        />
      </div>

      <div className="notification-grid">
        {currentNotifications.length > 0 ? (
          currentNotifications.map((notification) => {
            const formattedItem = formatNotificationForDisplay(
              notification,
              currentLanguage
            );

            return (
              <article key={notification.id}>
                <div className="image-wrapper">
                  <img
                    src={formattedItem.imageUrl || ""}
                    alt={formattedItem.title}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {notification.isOutstanding && (
                    <span className="badge-new">{t('frontend.home.featuredNews')}</span>
                  )}
                </div>
                <div className="content-wrapper">
                  <h2>
                    <Link
                      className="notification_title"
                      to={
                        currentLanguage === "vi"
                          ? `/thong-bao/${formattedItem.slug}.html`
                          : `/en/notifications/${formattedItem.slug}.html`
                      }
                    >
                      {formattedItem.title}
                    </Link>
                  </h2>
                  <div className="notification-meta">
                    <span>
                      <i className="far fa-calendar"></i>
                      {formattedItem.formattedDate}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="no-notifications">
            <p>Không có thông báo nào trong danh mục này.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`page-btn ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSection;
