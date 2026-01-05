import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./NotificationListPage.css";
import {
  getNotifications,
  getNotificationCategories,
  getNotificationsByCategory,
  getNotificationsByCategorySlug,
  searchNotifications,
  formatNotificationForDisplay,
} from "../../../services/clientNotificationService";
import { useI18n } from "../../../hooks/useI18n";
import NotificationSearchBox from "../../../components/Shared/NotificationSearchBox";
import LocalizedLink from "../../../components/Shared/LocalizedLink";

const NotificationListPage = () => {
  const { category } = useParams();
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationData, setNotificationData] = useState({
    items: [],
    totalPages: 0,
    totalCount: 0,
  });
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const itemsPerPage = 9;

  // Callbacks
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Initialize search term from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoaded(false);
        const categoriesData = await getNotificationCategories();
        setCategories(categoriesData);

        // Find current category
        if (category) {
          const foundCategory = categoriesData.find(
            (cat) =>
              (currentLanguage === "vi" ? cat.slugVi : cat.slugEn) === category
          );
          setCurrentCategory(foundCategory);
        } else {
          setCurrentCategory(null);
        }
      } catch (error) {} finally {
        setCategoriesLoaded(true);
      }
    };

    loadCategories();
  }, [category, currentLanguage]);

  // Load notification data when category, page, or search changes
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        let response;

        if (searchTerm.trim()) {
          // Search mode
          response = await searchNotifications(searchTerm, {
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            categoryId: currentCategory?.id,
          });
        } else if (category) {
          // Category mode - try using the new slug endpoint first
          try {
            response = await getNotificationsByCategorySlug(category, {
              pageNumber: currentPage,
              pageSize: itemsPerPage,
            });
          } catch (error) {
            // Fallback to old method if new endpoint fails
            if (currentCategory) {
              response = await getNotificationsByCategory(currentCategory.id, {
                pageNumber: currentPage,
                pageSize: itemsPerPage,
              });
            } else {
              response = await getNotifications({
                pageNumber: currentPage,
                pageSize: itemsPerPage,
              });
            }
          }
        } else {
          // All notifications mode
          response = await getNotifications({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
          });
        }

        setNotificationData(response);
      } catch (error) {setNotificationData({ items: [], totalPages: 0, totalCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    // Use timeout only for search to avoid too many requests
    if (searchTerm.trim()) {
      const timer = setTimeout(loadNotifications, 500);
      return () => clearTimeout(timer);
    } else {
      loadNotifications();
    }
  }, [category, currentCategory, currentPage, searchTerm, currentLanguage]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm, currentLanguage]);

  const getCategoryTitle = () => {
    if (!category) return t("frontend.notifications.allNotifications");
    return currentCategory
      ? currentLanguage === "vi"
        ? currentCategory.titleVi
        : currentCategory.titleEn
      : t("frontend.notifications.title");
  };

  // Show category not found only after categories are loaded and category not found
  if (category && categoriesLoaded && !currentCategory) {
    return (
      <div className="notification-list-page notificationlist-minimal">
        <div className="container">
          <div className="not-found notificationlist-empty">
            <h2>{t("frontend.notifications.categoryNotFound")}</h2>
            <p>{t("frontend.notifications.categoryNotExist", { category })}</p>
            <LocalizedLink
              routeKey="NOTIFICATIONS"
              className="back-to-notifications"
            >
              {t("frontend.notifications.backToNotifications")}
            </LocalizedLink>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="notification-list-root notification-list-page notificationlist-minimal">
        <div className="container">
          <div className="loading notificationlist-loading">
            <div className="loading-spinner" />
            <p>{t("frontend.notifications.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-list-root notification-list-page notificationlist-minimal">
      <div className="container">
        <h1 className="page-title-minimal">{getCategoryTitle()}</h1>
        <div className="notification-search-container">
          <NotificationSearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearchChange}
            placeholder={t("frontend.notifications.searchPlaceholder")}
          />
        </div>
        <div className="notificationlist-grid-minimal">
          {notificationData.items.length > 0 ? (
            notificationData.items.map((item) => {
              const formattedItem = formatNotificationForDisplay(
                item,
                currentLanguage
              );

              return (
                <div className="notificationlist-card-minimal" key={item.id}>
                  <LocalizedLink
                    to={
                      currentLanguage === "vi"
                        ? `/thong-bao/${formattedItem.slug}.html`
                        : `/en/notifications/${formattedItem.slug}.html`
                    }
                    className="notificationlist-img-link-minimal"
                  >
                    <img
                      src={formattedItem.imageUrl || ""}
                      alt={formattedItem.title}
                      className="notificationlist-img-minimal"
                      title={formattedItem.title}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </LocalizedLink>
                  <div className="notificationlist-content-minimal">
                    <span className="notificationlist-date-minimal">
                      {formattedItem.formattedDate}
                    </span>
                    <LocalizedLink
                      to={
                        currentLanguage === "vi"
                          ? `/thong-bao/${formattedItem.slug}.html`
                          : `/en/notifications/${formattedItem.slug}.html`
                      }
                      className="notificationlist-title-minimal clamp-2-lines"
                      title={formattedItem.title}
                    >
                      {formattedItem.title}
                    </LocalizedLink>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="notificationlist-empty">
              <p>
                {searchTerm
                  ? t("frontend.notifications.noSearchResults")
                  : t("frontend.notifications.noNotificationsInCategory")}
              </p>
            </div>
          )}
        </div>
        {notificationData.totalPages > 1 && (
          <div className="pagination-notificationlist-minimal">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn-notificationlist-minimal"
            >
              ←
            </button>
            {[...Array(notificationData.totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`pagination-btn-notificationlist-minimal${
                  currentPage === page + 1 ? " active" : ""
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === notificationData.totalPages}
              className="pagination-btn-notificationlist-minimal"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationListPage;
