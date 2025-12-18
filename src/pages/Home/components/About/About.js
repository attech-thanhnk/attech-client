import { useEffect, useState } from "react";
import "./About.css";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Function để lấy products với ảnh dynamic
const getProductsWithDynamicImages = (t, currentLanguage, aboutGalleries) => [
  {
    titleKey: "frontend.home.services.cns.title",
    images: aboutGalleries.cnsAtmImages,
    routeKey: "SERVICE_DETAIL",
    slug:
      currentLanguage === "vi" ? "thong-tin-dan-duong-giam-sat" : "cns-service",
  },
  {
    titleKey: "frontend.home.services.flight.title",
    images: aboutGalleries.bhcImages,
    routeKey: "SERVICE_DETAIL",
    slug:
      currentLanguage === "vi"
        ? "bay-kiem-tra-hieu-chuan"
        : "flight-inspection-service",
  },
  {
    titleKey: "frontend.home.services.industry.title",
    images: aboutGalleries.cnhkImages,
    routeKey: "PRODUCTS",
    slug: null,
  },
];

export default function About() {
  const { t, currentLanguage } = useI18n();
  const { getAboutGalleries, loading } = useBannerSettings();

  // Get dynamic gallery images - wait for loading to complete
  const aboutGalleries = getAboutGalleries();
  const products = getProductsWithDynamicImages(t, currentLanguage, aboutGalleries);
  const [currentIndices, setCurrentIndices] = useState(products.map(() => 0));

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });

    // Image carousel interval - only if images exist
    const interval = setInterval(() => {
      setCurrentIndices((prev) =>
        prev.map((index, i) => {
          const imageCount = products[i].images.length;
          return imageCount > 0 ? (index + 1) % imageCount : 0;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handler for dot click (không dùng nữa)
  // const handleDotClick = (productIdx, imgIdx) => {
  //   setCurrentIndices((prev) =>
  //     prev.map((val, i) => (i === productIdx ? imgIdx : val))
  //   );
  // };

  // Show loading state while fetching images
  if (loading) {
    return (
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-main-title">
            {t("frontend.home.featuredServices")}
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Đang tải...</div>
      </section>
    );
  }

  return (
    <section className="about-hero">
      <div className="about-hero-content">
        <h1 className="about-main-title">
          {t("frontend.home.featuredServices")}
        </h1>
      </div>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={24}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          769: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        }}
        className="about-hero-container"
      >
        {products.map((product, index) => (
          <SwiperSlide key={index}>
            <div
              className="about-hero-column"
              data-aos="fade-up"
              data-aos-delay={index * 200}
            >
              <div className="about-hero-images">
                {product.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={image}
                    alt={`${product.title} ${imgIndex + 1}`}
                    className={`carousel-image ${
                      imgIndex === currentIndices[index] ? "active" : ""
                    }`}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="about-hero-overlay">
                <div className="about-hero-content">
                  <h2 className="about-content-title">{t(product.titleKey)}</h2>
                  <div className="custom-btn-group">
                    <LocalizedLink
                      routeKey={product.routeKey}
                      params={{ slug: product.slug }}
                      className="custom-btn-more"
                    >
                      {t("common.viewMore")}
                      <ArrowIcon />
                    </LocalizedLink>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
