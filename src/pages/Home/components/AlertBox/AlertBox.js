import React, { useState, useEffect } from "react";
import "../AlertBox/AlertBox.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../../../../styles/swiper-custom.css";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useI18n } from "../../../../hooks/useI18n";
import { Link } from "react-router-dom";
import {
  getLatestNews,
  getNewsCategories,
  formatNewsForDisplay,
} from "../../../../services/clientNewsService";
import { DEFAULT_NEWS_IMAGE } from "../../../../constants/defaultImages";

function formatDate(isoString, lang) {
  const d = new Date(isoString);
  return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US");
}

const AlertBox = () => {
  const { currentLanguage } = useI18n();
  const [latestNews, setLatestNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, newsData] = await Promise.all([
          getNewsCategories(),
          getLatestNews(12),
        ]);

        setCategories(categoriesData);
        setLatestNews(newsData);
      } catch (error) {} finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  return (
    <div className="alert-box">
      <Swiper
        slidesPerView={5}
        spaceBetween={20}
        centeredSlides={false}
        loop={false}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={true}
        pagination={{ clickable: true }}
        modules={[Autoplay, Navigation, Pagination]}
        className="mySwiper"
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 0 },
          640: { slidesPerView: 2, spaceBetween: 0 },
          768: { slidesPerView: 3, spaceBetween: 15 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1200: { slidesPerView: 5, spaceBetween: 20 },
        }}
      >
        {loading ? (
          <SwiperSlide>
            <div className="wrap-item">
              <div className="loading-item">Loading news...</div>
            </div>
          </SwiperSlide>
        ) : (
          latestNews.map((item) => {
            const formattedItem = formatNewsForDisplay(item, currentLanguage);
            const category = categories.find(
              (cat) => cat.id === item.newsCategoryId
            );
            const categorySlug =
              currentLanguage === "vi" ? category?.slugVi : category?.slugEn;

            const link =
              currentLanguage === "vi"
                ? `/tin-tuc/${formattedItem.slug}.html`
                : `/en/news/${formattedItem.slug}.html`;

            return (
              <SwiperSlide key={item.id}>
                <Link
                  to={link}
                  aria-label={`Read more about ${formattedItem.title}`}
                >
                  <div className="wrap-item">
                    <div className="item-img" title={formattedItem.title}>
                      <img
                        src={
                          formattedItem.imageUrl || DEFAULT_NEWS_IMAGE
                        }
                        alt={formattedItem.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = DEFAULT_NEWS_IMAGE;
                        }}
                      />
                    </div>
                    <div
                      className="item-description"
                      title={formattedItem.title}
                    >
                      <p className="item-time">
                        <i
                          className="fa fa-calendar-days"
                          aria-hidden="true"
                        ></i>{" "}
                        {formattedItem.formattedDate}
                      </p>
                      <p className="item-text">{formattedItem.title}</p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })
        )}
      </Swiper>
    </div>
  );
};

export default AlertBox;
