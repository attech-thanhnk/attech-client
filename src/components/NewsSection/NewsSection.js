import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getLatestNews,
  getNewsCategories,
  formatNewsForDisplay,
} from "../../services/clientNewsService";
import { useI18n } from "../../hooks/useI18n";
import LocalizedLink from "../Shared/LocalizedLink";
import { DEFAULT_NEWS_IMAGE } from "../../constants/defaultImages";

const NewsSection = () => {
  const { currentLanguage, t } = useI18n();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);

        // Load categories and latest news in parallel
        const [categoriesData, latestNews] = await Promise.all([
          getNewsCategories(),
          getLatestNews(6),
        ]);

        setCategories(categoriesData);
        setNews(latestNews);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <section className="news-section">
        <div className="container">
          <div className="section-header">
            <h2>Tin tức mới nhất</h2>
            <Link to="/news" className="view-all-link">
              Xem tất cả
            </Link>
          </div>
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Đang tải tin tức...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="news-section">
      <div className="container">
        <div className="section-header">
          <h2>{t ? t("frontend.news.latestNews") : "Tin tức mới nhất"}</h2>
          <LocalizedLink routeKey="NEWS" className="view-all-link">
            {t ? t("common.viewAll") : "Xem tất cả"}
          </LocalizedLink>
        </div>

        <div className="news-grid">
          {news.map((item) => {
            const formattedItem = formatNewsForDisplay(item, currentLanguage);
            const category = categories.find(
              (cat) => cat.id === item.newsCategoryId
            );
            const categorySlug =
              currentLanguage === "vi" ? category?.slugVi : category?.slugEn;
            const categoryTitle =
              currentLanguage === "vi" ? category?.titleVi : category?.titleEn;

            return (
              <div className="news-item" key={item.id}>
                <div className="news-image">
                  <LocalizedLink
                    to={
                      currentLanguage === "vi"
                        ? `/tin-tuc/${formattedItem.slug}.html`
                        : `/en/news/${formattedItem.slug}.html`
                    }
                  >
                    <img
                      src={formattedItem.imageUrl || DEFAULT_NEWS_IMAGE}
                      alt={formattedItem.title}
                      title={formattedItem.title}
                      onError={(e) => {
                        e.target.src = DEFAULT_NEWS_IMAGE;
                      }}
                    />
                  </LocalizedLink>
                </div>
                <div className="news-content">
                  <div className="news-meta">
                    <span className="news-date">
                      {formattedItem.formattedDate}
                    </span>
                    {category && (
                      <span className="news-category">
                        <LocalizedLink
                          to={
                            currentLanguage === "vi"
                              ? `/tin-tuc/${categorySlug}`
                              : `/en/news/${categorySlug}`
                          }
                        >
                          {categoryTitle}
                        </LocalizedLink>
                      </span>
                    )}
                  </div>
                  <h3 className="news-title">
                    <LocalizedLink
                      to={
                        currentLanguage === "vi"
                          ? `/tin-tuc/${formattedItem.slug}.html`
                          : `/en/news/${formattedItem.slug}.html`
                      }
                    >
                      {formattedItem.title}
                    </LocalizedLink>
                  </h3>
                  <p className="news-summary">{formattedItem.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
