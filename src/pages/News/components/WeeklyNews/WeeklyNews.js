import React, { useState, useEffect } from "react";
import "./WeeklyNews.css";
import ViewAllButton from "../../../../components/ViewAllButton/ViewAllButton";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import {
  getNews,
  getNewsByCategorySlug,
  getNewsCategories,
  formatNewsForDisplay,
  CATEGORY_IDS,
} from "../../../../services/clientNewsService";

// Dùng ID thực từ database cho các danh mục con
const childCategoryIds = [
  CATEGORY_IDS.COMPANY_PARTY, // Đảng bộ công ty
  CATEGORY_IDS.COMPANY_UNION, // Công đoàn công ty
  CATEGORY_IDS.COMPANY_YOUTH_UNION, // Đoàn thanh niên công ty
];

// Helper functions for fallback data
const getCategorySlugById = (id, lang) => {
  const mapping = {
    [CATEGORY_IDS.COMPANY_ACTIVITIES]:
      lang === "vi" ? "hoat-dong-cong-ty" : "company-activities",
    [CATEGORY_IDS.COMPANY_PARTY]:
      lang === "vi" ? "dang-bo-cong-ty" : "party-committee",
    [CATEGORY_IDS.COMPANY_UNION]:
      lang === "vi" ? "cong-doan-cong-ty" : "company-union",
    [CATEGORY_IDS.COMPANY_YOUTH_UNION]:
      lang === "vi" ? "doan-thanh-nien-cong-ty" : "company-youth-union",
  };
  return mapping[id] || "";
};

const getCategoryTitleById = (id, lang) => {
  const mapping = {
    [CATEGORY_IDS.COMPANY_PARTY]:
      lang === "vi" ? "Đảng bộ công ty" : "Company Party Committee",
    [CATEGORY_IDS.COMPANY_UNION]:
      lang === "vi" ? "Công đoàn công ty" : "Company Union",
    [CATEGORY_IDS.COMPANY_YOUTH_UNION]:
      lang === "vi" ? "Đoàn thanh niên công ty" : "Company Youth Union",
  };
  return mapping[id] || "";
};

const WeeklyNews = () => {
  const { currentLanguage } = useI18n();
  const [groupedNews, setGroupedNews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getNewsCategories();

        // Load tin cho TỪNG category riêng biệt bằng API category slug
        const grouped = {};

        await Promise.all(
          childCategoryIds.map(async (categoryId) => {
            // Find category data from API or use fallback
            const category = categoriesData.find(
              (cat) => cat.id === categoryId
            ) || {
              id: categoryId,
              slugVi: getCategorySlugById(categoryId, "vi"),
              slugEn: getCategorySlugById(categoryId, "en"),
              titleVi: getCategoryTitleById(categoryId, "vi"),
              titleEn: getCategoryTitleById(categoryId, "en"),
            };

            const categorySlug = category.slugVi;

            // Gọi API lấy tin theo slug
            const categoryNewsData = await getNewsByCategorySlug(categorySlug, {
              pageIndex: 1,
              pageSize: 5, // Lấy 5 tin mới nhất (hiển thị 4, dự phòng 1)
              sortBy: "timePosted",
              sortDirection: "desc",
            });

            // Only add to grouped if we have news
            if (categoryNewsData.items.length > 0) {
              grouped[categorySlug] = {
                category: category,
                news: categoryNewsData.items,
              };
            }
          })
        );

        setGroupedNews(grouped);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentLanguage]);

  if (loading) {
    return (
      <div className="weekly-news-area">
        <div className="container">
          <div>Loading weekly news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-news-area">
      <div className="container">
        <div className="weekly-news-child-categories">
          {childCategoryIds.map((categoryId) => {
            // Find the category data by matching category ID
            const categorySlug = getCategorySlugById(categoryId, "vi");
            const categoryData = groupedNews[categorySlug];

            // Skip if no data for this category
            if (!categoryData) return null;

            const newsList = categoryData.news.slice(0, 4);
            if (newsList.length === 0) return null;

            const categoryName =
              currentLanguage === "vi"
                ? categoryData.category.titleVi
                : categoryData.category.titleEn;

            return (
              <div key={categorySlug} className="weekly-wrapper">
                <div className="section-tittle">
                  <h4 className="title-category">{categoryName}</h4>
                  <ViewAllButton
                    to={
                      currentLanguage === "vi"
                        ? `/tin-tuc/${categorySlug}`
                        : `/en/news/${categorySlug}`
                    }
                  />
                </div>
                <div className="weekly-news-active">
                  {newsList.map((news) => {
                    const formattedItem = formatNewsForDisplay(
                      news,
                      currentLanguage
                    );
                    return (
                      <div key={news.id} className="weekly-single">
                        <div className="weekly-img">
                          <img
                            src={
                              formattedItem.imageUrl ||
                              "/images/default-news.jpg"
                            }
                            alt={formattedItem.title}
                            title={formattedItem.title}
                            onError={(e) => {
                              e.target.src = "/images/default-news.jpg";
                            }}
                          />
                        </div>
                        <div className="weekly-caption">
                          <span className="time-news">
                            {formattedItem.formattedDate}
                          </span>
                          <h4>
                            <LocalizedLink
                              to={
                                currentLanguage === "vi"
                                  ? `/tin-tuc/${formattedItem.slug}.html`
                                  : `/en/news/${formattedItem.slug}.html`
                              }
                              title={formattedItem.title}
                              className="clamp-2-lines"
                            >
                              {formattedItem.title}
                            </LocalizedLink>
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyNews;
