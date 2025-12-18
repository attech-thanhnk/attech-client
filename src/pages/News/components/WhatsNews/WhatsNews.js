import React, { useState, useEffect } from "react";
import {
  getNewsByCategorySlug,
  getNewsCategories,
  formatNewsForDisplay,
  CATEGORY_IDS,
} from "../../../../services/clientNewsService";
import { Link } from "react-router-dom";
import ViewAllButton from "../../../../components/ViewAllButton/ViewAllButton";
import { useI18n } from "../../../../hooks/useI18n";
import "./WhatsNews.css";
import { DEFAULT_NEWS_IMAGE } from "../../../../constants/defaultImages";

const WhatsNews = () => {
  const { currentLanguage, t } = useI18n();
  const [aviationNews, setAviationNews] = useState([]);
  const [aviationCategory, setAviationCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Responsive: mobile chỉ hiển thị 2 bài, desktop 5 bài
  const [newsCount, setNewsCount] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setNewsCount(window.innerWidth <= 768 ? 2 : 5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getNewsCategories();
        setCategories(categoriesData);

        // Get Aviation News using slug (better approach)
        const aviationSlug = "tin-nganh-hang-khong"; // Vietnamese slug for Aviation News
        const newsResponse = await getNewsByCategorySlug(aviationSlug, {
          pageIndex: 1,
          pageSize: 10,
          sortBy: "timePosted",
          sortDirection: "desc",
        });// Find aviation category for display purposes
        const aviationCat = categoriesData.find(
          (cat) => cat.slugVi === aviationSlug
        ) || {
          id: CATEGORY_IDS.AVIATION_NEWS,
          slugVi: "tin-nganh-hang-khong",
          slugEn: "aviation-news",
          titleVi: "Tin ngành hàng không",
          titleEn: "Aviation News",
        };

        // Always use aviation category, even if no news found
        setAviationCategory(aviationCat);
        setAviationNews(newsResponse.items || []);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentLanguage]);

  const newsToShow = aviationNews.slice(0, newsCount);

  const getNewsLink = (news) => {
    const formattedItem = formatNewsForDisplay(news, currentLanguage);
    const categorySlug =
      currentLanguage === "vi"
        ? aviationCategory?.slugVi
        : aviationCategory?.slugEn;

    return currentLanguage === "vi"
      ? `/tin-tuc/${formattedItem.slug}.html`
      : `/en/news/${formattedItem.slug}.html`;
  };

  // Lấy tên category ngành hàng không (ưu tiên i18n, fallback sang titleVi/titleEn nếu chưa có key i18n)
  const aviationCategoryName =
    t("frontend.home.newsCategories.aviationNews") ||
    (currentLanguage === "vi"
      ? aviationCategory?.titleVi || "Tin ngành hàng không"
      : aviationCategory?.titleEn || "Aviation News");

  const aviationSlug =
    currentLanguage === "vi"
      ? aviationCategory?.slugVi
      : aviationCategory?.slugEn;

  return (
    <section className="whats-news-area pt-50 pb-20">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="row d-flex justify-content-between align-items-center">
              <div className="col-lg-5 col-md-5 pd_0">
                <div className="section-tittle mb-20">
                  <h3>{aviationCategoryName}</h3>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 text-end d-none d-md-block">
                <ViewAllButton
                  to={
                    currentLanguage === "vi"
                      ? `/tin-tuc/${aviationSlug}`
                      : `/en/news/${aviationSlug}`
                  }
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12 pd_0">
                <div className="whats-news-caption">
                  <div className="whats-news-grid">
                    {loading ? (
                      <div>Loading aviation news...</div>
                    ) : newsToShow.length === 0 ? (
                      <div className="no-news-message">
                        <p>Hiện tại chưa có tin tức trong mục này.</p>
                      </div>
                    ) : (
                      newsToShow.map((news, idx) => {
                        const formattedItem = formatNewsForDisplay(
                          news,
                          currentLanguage
                        );
                        return (
                          <div className="whats-news-card" key={news.id}>
                            <div className="what-img">
                              <img
                                src={
                                  formattedItem.imageUrl ||
                                  DEFAULT_NEWS_IMAGE
                                }
                                alt={formattedItem.title}
                                onError={(e) => {
                                  e.target.src = DEFAULT_NEWS_IMAGE;
                                }}
                              />
                            </div>
                            <div className="what-cap">
                              <span className="title-news">
                                {formattedItem.formattedDate}
                              </span>
                              <h4>
                                <Link to={getNewsLink(news)}>
                                  {formattedItem.title}
                                </Link>
                              </h4>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {/* Nút xem tất cả cho mobile */}
                  <div className="d-block d-md-none mt-3 text-center">
                    <ViewAllButton
                      to={
                        currentLanguage === "vi"
                          ? `/tin-tuc/${aviationSlug}`
                          : `/en/news/${aviationSlug}`
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsNews;
