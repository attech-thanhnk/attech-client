import React, { useState, useEffect } from "react";
import "./TrendingArea.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "../../../../styles/swiper-custom.css";
import { Autoplay, Navigation } from "swiper/modules";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import ViewAllButton from "../../../../components/ViewAllButton/ViewAllButton";
import {
  getNewsByCategorySlug,
  getNewsCategories,
  formatNewsForDisplay,
  CATEGORY_IDS,
} from "../../../../services/clientNewsService";
import { DEFAULT_NEWS_IMAGE } from "../../../../constants/defaultImages";

const TrendingArea = () => {
  const { t, currentLanguage } = useI18n();
  const [newsData, setNewsData] = useState([]);
  const [trendingRight, setTrendingRight] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getNewsCategories();
        setCategories(categoriesData);

        const categorySlug = currentLanguage === "vi" ? "hoat-dong-cong-ty" : "company-activities";

        // Gọi API 2 lần song song
        const [mainNews, rightNews] = await Promise.all([
          // Top + Bottom: 6 tin đầu
          getNewsByCategorySlug(categorySlug, {
            pageIndex: 1,
            pageSize: 6,
            sortBy: "timePosted",
            sortDirection: "desc",
          }),
          // Right: Lấy hết tin từ trang 2 trở đi
          getNewsByCategorySlug(categorySlug, {
            pageIndex: 2,
            pageSize: 100,
            sortBy: "timePosted",
            sortDirection: "desc",
          }),
        ]);

        setNewsData(mainNews.items || []);
        setTrendingRight(rightNews.items || []);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentLanguage]);

  const getNewsLink = (item) => {
    const formattedItem = formatNewsForDisplay(item, currentLanguage);
    const category = categories.find((cat) => cat.id === item.newsCategoryId);
    const categorySlug =
      currentLanguage === "vi" ? category?.slugVi : category?.slugEn;

    return currentLanguage === "vi"
      ? `/tin-tuc/${formattedItem.slug}.html`
      : `/en/news/${formattedItem.slug}.html`;
  };

  const trendingTop = newsData.slice(0, 3);
  const trendingBottom = newsData.slice(3, 6);
  return (
    <div className="trending-area">
      <div className="container">
        <div className="trending-main">
          <div className="row">
            <div className="col-12 pd_0">
              <div className="section-tittle">
                <h3>{t("frontend.home.newsCategories.companyActivities")}</h3>
                <ViewAllButton
                  to={
                    currentLanguage === "vi"
                      ? "/tin-tuc/hoat-dong-cong-ty"
                      : "/en/news/company-activities"
                  }
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8 col-md-12 pd_0">
              <div className="trending-top-wrapper">
                <Swiper
                  className="trending-top mb-30"
                  spaceBetween={0}
                  modules={[Autoplay, Navigation]}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  loop={trendingTop.length > 1}
                  slidesPerView={1}
                  navigation={true}
                >
                  {trendingTop.map((item) => {
                    const formattedItem = formatNewsForDisplay(
                      item,
                      currentLanguage
                    );
                    return (
                      <SwiperSlide key={item.id}>
                        <div className="trend-top-img">
                          <img
                            src={
                              formattedItem.imageUrl ||
                              DEFAULT_NEWS_IMAGE
                            }
                            alt={formattedItem.title}
                            title={formattedItem.title}
                            onError={(e) => {
                              e.target.src = DEFAULT_NEWS_IMAGE;
                            }}
                          />
                          <div className="trend-top-cap">
                            <h2>{formattedItem.title}</h2>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
              <div className="trending-bottom">
                <Swiper
                  spaceBetween={20}
                  slidesPerView={3}
                  navigation
                  breakpoints={{
                    320: { slidesPerView: 1.1, spaceBetween: 12 },
                    576: { slidesPerView: 2, spaceBetween: 15 },
                    1248: { slidesPerView: 3, spaceBetween: 20 },
                  }}
                  className="trending-bottom-swiper"
                >
                  {trendingBottom.map((item) => {
                    const formattedItem = formatNewsForDisplay(
                      item,
                      currentLanguage
                    );
                    return (
                      <SwiperSlide key={item.id}>
                        <div className="single-bottom">
                          <div className="trend-bottom-img">
                            <img
                              src={
                                formattedItem.imageUrl ||
                                DEFAULT_NEWS_IMAGE
                              }
                              alt={formattedItem.title}
                              title={formattedItem.title}
                              onError={(e) => {
                                e.target.src = DEFAULT_NEWS_IMAGE;
                              }}
                            />
                          </div>
                          <div className="trend-bottom-cap">
                            <span className="color1">
                              {formattedItem.formattedDate}
                            </span>
                            <h4>
                              <LocalizedLink
                                to={getNewsLink(item)}
                                title={formattedItem.title}
                              >
                                {formattedItem.title}
                              </LocalizedLink>
                            </h4>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 pd_0">
              <Swiper
                direction="vertical"
                spaceBetween={10}
                slidesPerView={6}
                autoplay={{ delay: 30000, disableOnInteraction: false }}
                loop={trendingRight.length > 6}
                modules={[Autoplay]}
                className="trand-right-swiper"
                breakpoints={{
                  320: {
                    direction: "horizontal",
                    slidesPerView: 1.2,
                    spaceBetween: 12,
                  },
                  576: {
                    direction: "horizontal",
                    slidesPerView: 2,
                    spaceBetween: 15,
                  },
                  992: {
                    direction: "vertical",
                    slidesPerView: 6,
                    spaceBetween: 10,
                  },
                }}
              >
                {trendingRight.map((item) => {
                  const formattedItem = formatNewsForDisplay(
                    item,
                    currentLanguage
                  );
                  return (
                    <SwiperSlide key={item.id}>
                      <div className="trand-right-single d-flex">
                        <div className="trand-right-img">
                          <img
                            src={
                              formattedItem.imageUrl ||
                              DEFAULT_NEWS_IMAGE
                            }
                            alt={formattedItem.title}
                            title={formattedItem.title}
                            onError={(e) => {
                              e.target.src = DEFAULT_NEWS_IMAGE;
                            }}
                          />
                        </div>
                        <div className="trand-right-cap">
                          <span className="color3">
                            {formattedItem.formattedDate}
                          </span>
                          <h4>
                            <LocalizedLink
                              to={getNewsLink(item)}
                              title={formattedItem.title}
                            >
                              {formattedItem.title}
                            </LocalizedLink>
                          </h4>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingArea;
