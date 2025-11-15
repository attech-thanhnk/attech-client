import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Feature.css";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import { LocalizedTitle } from "../../../../components/Shared/LocalizedContent";
import {
  getOutstandingNews,
  getNewsCategories,
  formatNewsForDisplay,
} from "../../../../services/clientNewsService";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";
import { DEFAULT_NEWS_IMAGE } from "../../../../constants/defaultImages";

const Feature = () => {
  const { t, currentLanguage } = useI18n();
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getFeatureBackgrounds } = useBannerSettings();
  
  // Get feature background images with fallbacks
  const featureBackgrounds = getFeatureBackgrounds();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, newsData] = await Promise.all([
          getNewsCategories(),
          getOutstandingNews({
            pageIndex: 1,
            pageSize: 10,
            sortBy: "timePosted",
            sortDirection: "desc",
          }),
        ]);

        setCategories(categoriesData);
        setFeaturedNews(newsData.items || []);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section className="feature-section">
      <div className="feature-container">
        {/* 3 dịch vụ chính */}
        <LocalizedLink
          routeKey="SERVICE_DETAIL"
          params={{
            slug:
              currentLanguage === "vi"
                ? "thong-tin-dan-duong-giam-sat"
                : "cns-service",
          }}
          className="feature-link"
        >
          <div
            className="feature-item"
            style={{
              backgroundImage: `url(${featureBackgrounds.cns})`,
            }}
          >
            <div className="feature-overlay"></div>
            <div className="feature-icon">
              <i className="fas fa-satellite"></i>
            </div>
            <div className="feature-text">
              <h3>{t("frontend.home.services.cns.title")}</h3>
              {/* <p className="feature-desc">
                {t("frontend.home.services.cns.description")}
              </p> */}
            </div>
          </div>
        </LocalizedLink>
        <LocalizedLink
          routeKey="SERVICE_DETAIL"
          params={{
            slug:
              currentLanguage === "vi"
                ? "bay-kiem-tra-hieu-chuan"
                : "calibration-service",
          }}
          className="feature-link"
        >
          <div
            className="feature-item"
            style={{ backgroundImage: `url(${featureBackgrounds.bhc})` }}
          >
            <div className="feature-overlay"></div>
            <div className="feature-icon">
              <i className="fas fa-plane"></i>
            </div>
            <div className="feature-text">
              <h3>{t("frontend.home.services.flight.title")}</h3>
              {/* <p className="feature-desc">
                {t("frontend.home.services.flight.description")}
              </p> */}
            </div>
          </div>
        </LocalizedLink>
        <LocalizedLink routeKey="PRODUCTS" className="feature-link">
          <div
            className="feature-item"
            style={{ backgroundImage: `url(${featureBackgrounds.cnhk})` }}
          >
            <div className="feature-overlay"></div>
            <div className="feature-icon">
              <i className="fas fa-globe"></i>
            </div>
            <div className="feature-text">
              <h3>{t("frontend.home.services.industry.title")}</h3>
              {/* <p className="feature-desc">
                {t("frontend.home.services.industry.description")}
              </p> */}
            </div>
          </div>
        </LocalizedLink>

        {/* Tin tức nổi bật */}
        <div className="notify-wrapper">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={15}
            slidesPerView={2}
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 1,
              },
              1024: {
                slidesPerView: 2,
              },
            }}
            style={{ width: "100%", height: "100%" }}
          >
            {loading ? (
              <SwiperSlide>
                <div className="notify-item">
                  <div className="notify-loading">Loading featured news...</div>
                </div>
              </SwiperSlide>
            ) : (
              featuredNews.map((item, index) => {
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
                  <SwiperSlide key={index}>
                    <LocalizedLink
                      to={
                        currentLanguage === "vi"
                          ? `/tin-tuc/${formattedItem.slug}.html`
                          : `/en/news/${formattedItem.slug}.html`
                      }
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="notify-item" title={formattedItem.title}>
                        <div className="notify-img">
                          <img
                            src={
                              formattedItem.imageUrl ||
                              DEFAULT_NEWS_IMAGE
                            }
                            alt={formattedItem.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = DEFAULT_NEWS_IMAGE;
                            }}
                          />
                          <span className="news-badge">
                            {t("frontend.home.featuredNews")}
                          </span>
                        </div>
                        <p className="notify-title" title={formattedItem.title}>
                          {formattedItem.title}
                        </p>
                      </div>
                    </LocalizedLink>
                  </SwiperSlide>
                );
              })
            )}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Feature;
