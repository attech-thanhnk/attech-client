import React, { useEffect, useState } from "react";
import "./PartNews.css";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import {
  LocalizedTitle,
  LocalizedDescription,
} from "../../../../components/Shared/LocalizedContent";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  getNews,
  getNewsByCategory,
  getNewsByCategorySlug,
  getNewsCategories,
  formatNewsForDisplay,
  CATEGORY_IDS,
} from "../../../../services/clientNewsService";

// Dynamic category mapping based on slug
const getCategoryTitleKey = (slug) => {
  const mapping = {
    "hoat-dong-cong-ty": "frontend.home.newsCategories.companyActivities",
    "company-activities": "frontend.home.newsCategories.companyActivities",
    "dang-bo-cong-ty": "frontend.home.newsCategories.partyCommittee",
    "company-party": "frontend.home.newsCategories.partyCommittee",
    "doan-thanh-nien-cong-ty": "frontend.home.newsCategories.youthUnion",
    "company-youth-union": "frontend.home.newsCategories.youthUnion",
    "cong-doan-cong-ty": "frontend.home.newsCategories.tradeUnion",
    "company-union": "frontend.home.newsCategories.tradeUnion",
    "tin-nganh-hang-khong": "frontend.home.newsCategories.aviationNews",
    "aviation-news": "frontend.home.newsCategories.aviationNews",
  };
  return mapping[slug] || `category.${slug}`;
};

function formatDate(isoString, locale) {
  const d = new Date(isoString);
  return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US");
}

const PartNews = () => {
  const { t, currentLanguage } = useI18n();
  const [newsGroups, setNewsGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);

        // Step 1: Load all available categories from API
        const categories = await getNewsCategories();

        if (categories.length === 0) {
          setNewsGroups([]);
          return;
        }

        // Step 2: Lấy 4 categories cố định cho trang chủ (ID: 2,3,4,5)
        const featuredCategoryIds = [2, 3, 4, 5]; // Hoạt động Công ty, Đảng bộ, Công đoàn, Đoàn TN

        // Step 3: Load tin cho TỪNG category riêng biệt bằng API category slug
        const newsGroupsWithData = await Promise.all(
          featuredCategoryIds
            .map((categoryId) => categories.find((cat) => cat.id === categoryId))
            .filter((category) => category)
            .map(async (category) => {
              // Gọi API lấy tin theo slug của category
              const categorySlug = category.slugVi;
              const categoryNewsData = await getNewsByCategorySlug(categorySlug, {
                pageNumber: 1,
                pageSize: 1, // Chỉ cần 1 tin mới nhất
                sortBy: "timePosted",
                sortDirection: "desc",
              });

              const featuredNews = categoryNewsData.items.length > 0
                ? categoryNewsData.items[0]
                : null;

              // Get title key for translation
              const titleKey =
                getCategoryTitleKey(category.slugVi) ||
                getCategoryTitleKey(category.slugEn);

              return {
                id: category.id,
                slugVi: category.slugVi,
                slugEn: category.slugEn,
                titleKey,
                featuredNews,
                categoryData: category,
                hasNews: !!featuredNews,
              };
            })
        );

        setNewsGroups(newsGroupsWithData);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    loadNewsData();
  }, [t, currentLanguage]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  if (loading) {
    return (
      <section className="part_news">
        <div className="part_news__container">
          <div className="news__grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="news__card loading-skeleton">
                <div className="skeleton-loader"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="part_news">
      <div className="part_news__container">
        <div className="news__grid">
          {newsGroups.map((group, index) => {
            const categorySlug =
              currentLanguage === "vi"
                ? group.categoryData.slugVi
                : group.categoryData.slugEn;

            // Handle case when no news found for category
            if (!group.hasNews || !group.featuredNews) {
              return (
                <article
                  key={group.id}
                  className="news__card news__card--no-content"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="news__card-header">
                    <LocalizedLink
                      to={`${
                        currentLanguage === "vi" ? "/tin-tuc" : "/en/news"
                      }/${categorySlug}`}
                      className="news__card-title"
                    >
                      <span>{t(group.titleKey)}</span>
                    </LocalizedLink>
                  </div>

                  <div className="news__image-container">
                    <LocalizedLink
                      to={`${
                        currentLanguage === "vi" ? "/tin-tuc" : "/en/news"
                      }/${categorySlug}`}
                    >
                      <div className="news__image news__image--placeholder">
                        <i
                          className="fas fa-newspaper"
                          style={{ fontSize: "3rem", color: "#cbd5e1" }}
                        ></i>
                      </div>
                    </LocalizedLink>
                    <div className="news__date-badge">
                      <i className="far fa-clock"></i>
                      <span>--</span>
                    </div>
                  </div>

                  <div className="news__content">
                    <div className="news__article-title news__no-content">
                      <span>
                        {currentLanguage === "vi"
                          ? "Chưa có tin tức"
                          : "No news available"}
                      </span>
                    </div>
                    <p className="news__excerpt">
                      {currentLanguage === "vi"
                        ? "Chưa có tin tức trong danh mục này"
                        : "No news in this category yet"}
                    </p>
                    <LocalizedLink
                      to={`${
                        currentLanguage === "vi" ? "/tin-tuc" : "/en/news"
                      }/${categorySlug}`}
                      className="news__read-more"
                    >
                      {t("common.readMore")}
                    </LocalizedLink>
                  </div>
                </article>
              );
            }

            // Normal case with news
            const formattedNews = formatNewsForDisplay(
              group.featuredNews,
              currentLanguage
            );

            return (
              <article
                key={group.slugVi}
                className="news__card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="news__card-header">
                  <LocalizedLink
                    to={`${
                      currentLanguage === "vi" ? "/tin-tuc" : "/en/news"
                    }/${categorySlug}`}
                    className="news__card-title"
                  >
                    <span>{t(group.titleKey)}</span>
                  </LocalizedLink>
                </div>

                <div className="news__image-container">
                  <LocalizedLink
                    to={`${
                      currentLanguage === "vi"
                        ? `/tin-tuc/${formattedNews.slug}.html`
                        : `/en/news/${formattedNews.slug}.html`
                    }`}
                  >
                    {formattedNews.imageUrl ? (
                      <img
                        src={formattedNews.imageUrl}
                        alt={formattedNews.title}
                        className="news__image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML =
                            '<div class="news__image news__image--placeholder" style="display: flex; align-items: center; justify-content: center; background: #f8fafc;"><i class="fas fa-newspaper" style="font-size: 3rem; color: #cbd5e1;"></i></div>';
                        }}
                      />
                    ) : (
                      <div className="news__image news__image--placeholder">
                        <i
                          className="fas fa-newspaper"
                          style={{ fontSize: "3rem", color: "#cbd5e1" }}
                        ></i>
                      </div>
                    )}
                  </LocalizedLink>
                  <div className="news__date-badge">
                    <i className="far fa-clock"></i>
                    <span>{formattedNews.formattedDate}</span>
                  </div>
                </div>

                <div className="news__content">
                  <LocalizedLink
                    to={`${
                      currentLanguage === "vi"
                        ? `/tin-tuc/${formattedNews.slug}.html`
                        : `/en/news/${formattedNews.slug}.html`
                    }`}
                    className="news__article-title"
                  >
                    <span>{formattedNews.title}</span>
                  </LocalizedLink>
                  <p className="news__excerpt">{formattedNews.description}</p>
                  <LocalizedLink
                    to={`${
                      currentLanguage === "vi" ? "/tin-tuc" : "/en/news"
                    }/${categorySlug}`}
                    className="news__read-more"
                  >
                    {t("common.readMore")}
                  </LocalizedLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartNews;
