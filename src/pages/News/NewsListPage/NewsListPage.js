import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getNews,
  getNewsCategories,
  getNewsByCategory,
  getNewsByCategorySlug,
  searchNews,
  formatNewsForDisplay,
} from "../../../services/clientNewsService";
import { useI18n } from "../../../hooks/useI18n";
import LocalizedLink from "../../../components/Shared/LocalizedLink";
import SearchBox from "../../../components/Shared/SearchBox";
import "./NewsListPage.css";

const NewsListPage = () => {
  const { currentLanguage } = useI18n();
  const { t } = useTranslation();
  const { category, parent } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [newsData, setNewsData] = useState({
    items: [],
    totalPages: 0,
    totalCount: 0,
  });
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const searchInputRef = useRef(null);
  const itemsPerPage = 9;

  // Callbacks - must be at top level
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
        const categoriesData = await getNewsCategories();
        setCategories(categoriesData);

        // Find current category - handle both 1-level and 2-level routing
        if (category) {
          // For 2-level routing: /tin-tuc/parent/category
          const targetSlug = parent ? category : category;

          const foundCategory = categoriesData.find(
            (cat) =>
              (currentLanguage === "vi" ? cat.slugVi : cat.slugEn) ===
              targetSlug
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
  }, [category, parent, currentLanguage]);

  // Load news data when category, page, or search changes
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        let response;

        if (searchTerm.trim()) {
          // Search mode
          response = await searchNews(searchTerm, {
            pageIndex: currentPage,
            pageSize: itemsPerPage,
            categoryId: currentCategory?.id,
          });
        } else if (category) {
          // Category mode - use slug to get news
          const targetSlug = category;

          try {
            response = await getNewsByCategorySlug(targetSlug, {
              pageIndex: currentPage,
              pageSize: itemsPerPage,
            });
          } catch (error) {
            // Fallback to old method if new endpoint fails
            if (currentCategory) {
              response = await getNewsByCategory(currentCategory.id, {
                pageIndex: currentPage,
                pageSize: itemsPerPage,
              });
            } else {
              response = await getNews({
                pageIndex: currentPage,
                pageSize: itemsPerPage,
              });
            }
          }
        } else {
          // All news mode
          response = await getNews({
            pageIndex: currentPage,
            pageSize: itemsPerPage,
          });
        }

        setNewsData(response);
      } catch (error) {setNewsData({ items: [], totalPages: 0, totalCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    // Use timeout only for search to avoid too many requests
    if (searchTerm.trim()) {
      const timer = setTimeout(loadNews, 500);
      return () => clearTimeout(timer);
    } else {
      loadNews();
    }
  }, [category, currentCategory, currentPage, searchTerm, currentLanguage]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm, currentLanguage]);

  // Show category not found only after categories are loaded and category not found
  if (
    category &&
    categoriesLoaded &&
    !currentCategory
  ) {
    return (
      <div className="news-list-page newslist-minimal">
        <div className="container">
          <div className="not-found newslist-empty">
            <h2>{t("frontend.news.categoryNotFound")}</h2>
            <p>{t("frontend.news.categoryNotExist", { category })}</p>
            <LocalizedLink routeKey="NEWS" className="back-to-news">
              {t("frontend.news.backToNews")}
            </LocalizedLink>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryTitle = () => {
    if (!category) return t("frontend.news.allNews");

    return currentCategory
      ? currentLanguage === "vi"
        ? currentCategory.titleVi
        : currentCategory.titleEn
      : t("frontend.news.title");
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="news-list-page newslist-minimal">
        <div className="container">
          <div className="loading newslist-loading">
            <div className="loading-spinner" />
            <p>{t("frontend.news.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-list-root news-list-page newslist-minimal">
      <div className="container">
        <h1 className="page-title-minimal">{getCategoryTitle()}</h1>
        <div className="search-box-container">
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearchChange}
            placeholder={t("frontend.news.searchPlaceholder")}
          />
        </div>
        <div className="newslist-grid-minimal">
          {newsData.items.length > 0 ? (
            newsData.items.map((item) => {
              const formattedItem = formatNewsForDisplay(item, currentLanguage);
              const categorySlug =
                currentLanguage === "vi"
                  ? categories.find((cat) => cat.id === item.newsCategoryId)
                      ?.slugVi
                  : categories.find((cat) => cat.id === item.newsCategoryId)
                      ?.slugEn;

              return (
                <div className="newslist-card-minimal" key={item.id}>
                  <LocalizedLink
                    to={
                      currentLanguage === "vi"
                        ? `/tin-tuc/${formattedItem.slug}.html`
                        : `/en/news/${formattedItem.slug}.html`
                    }
                    className="newslist-img-link-minimal"
                  >
                    <img
                      src={formattedItem.imageUrl || ""}
                      alt={formattedItem.title}
                      className="newslist-img-minimal"
                      title={formattedItem.title}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </LocalizedLink>
                  <div className="newslist-content-minimal">
                    <span className="newslist-date-minimal">
                      {formattedItem.formattedDate}
                    </span>
                    <LocalizedLink
                      to={
                        currentLanguage === "vi"
                          ? `/tin-tuc/${formattedItem.slug}.html`
                          : `/en/news/${formattedItem.slug}.html`
                      }
                      className="newslist-title-minimal clamp-2-lines"
                      title={formattedItem.title}
                    >
                      {formattedItem.title}
                    </LocalizedLink>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="newslist-empty">
              <p>
                {searchTerm
                  ? t("frontend.news.noSearchResults")
                  : t("frontend.news.noNewsInCategory")}
              </p>
            </div>
          )}
        </div>
        {newsData.totalPages > 1 && (
          <div className="pagination-newslist-minimal">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn-minimal"
            >
              ←
            </button>
            {[...Array(newsData.totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`pagination-btn-minimal${
                  currentPage === page + 1 ? " active" : ""
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === newsData.totalPages}
              className="pagination-btn-minimal"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsListPage;
