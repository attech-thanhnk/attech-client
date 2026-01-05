import React, { useState, useEffect } from "react";
import "../NewsSection/NewsSection.css";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import {
  getOutstandingNews,
  getNewsCategories,
  formatNewsForDisplay,
} from "../../../../services/clientNewsService";

const NewsSection = () => {
  const { t, currentLanguage } = useI18n();
  const [trendingNews, setTrendingNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, outstandingNewsData] = await Promise.all([
          getNewsCategories(),
          getOutstandingNews({
            pageNumber: 1,
            pageSize: 7,
            sortBy: "timePosted",
            sortDirection: "desc",
          }),
        ]);

        setCategories(categoriesData);
        setTrendingNews(outstandingNewsData.items || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section id="newsSection">
      <div className="row">
        <div className="col-lg-12 col-md-12 p-0">
          <div className="news-section-container">
            <div
              className="news-section-header"
              style={{ justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="trend-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 12l4-4 4 4 4-8"
                      stroke="#0a407c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="trend-label">
                  {t("frontend.news.trending")}
                </span>
              </div>
            </div>
            <div className="trend-ticker">
              <div className="trend-list">
                {loading ? (
                  <div className="trend-loading">Loading trending news...</div>
                ) : (
                  [...trendingNews, ...trendingNews].map((item, idx) => {
                    const formattedItem = formatNewsForDisplay(
                      item,
                      currentLanguage
                    );
                    const category = categories.find(
                      (cat) => cat.id === item.newsCategoryId
                    );
                    const categorySlug =
                      currentLanguage === "vi"
                        ? category?.slugVi
                        : category?.slugEn;

                    return (
                      <LocalizedLink
                        key={item.id + "-" + idx}
                        to={
                          currentLanguage === "vi"
                            ? `/tin-tuc/${formattedItem.slug}.html`
                            : `/en/news/${formattedItem.slug}.html`
                        }
                        className="trend-link"
                      >
                        #{formattedItem.title}
                      </LocalizedLink>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
