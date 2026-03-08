import { lazy, Suspense, useMemo } from "react";
import { useLocation } from "react-router-dom";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";

// Lazy load components for better performance
const AlertBox = lazy(() => import("../components/AlertBox/AlertBox"));
const Feature = lazy(() => import("../components/Feature/Feature"));
const About = lazy(() => import("../components/About/About"));
const Fact = lazy(() => import("../components/Fact/Fact"));
const Media = lazy(() => import("../components/Media/Media"));
const Carousel = lazy(() =>
  import("../../../components/Shared/Layout/Carousel/Carousel")
);
const PartNews = lazy(() => import("../components/PartNews/PartNews"));

const Home = () => {
  const { t, currentLanguage } = useI18n();
  const location = useLocation();

  // Memoize SEO content to avoid recalculation on every render
  const currentSEO = useMemo(() => {
    const seoContent = {
      vi: {
        title: "Trang chủ | Công ty TNHH Kỹ thuật Quản lý bay | ATTECH",
        description:
          "ATTECH là một trong những doanh nghiệp hàng đầu trong lĩnh vực kỹ thuật hàng không tại Việt Nam, chuyên cung cấp dịch vụ CNS, bay kiểm tra hiệu chuẩn và sản xuất thiết bị phục vụ ngành công nghiệp hàng không .",
        keywords:
          "ATTECH, kỹ thuật hàng không, CNS, quản lý bay, thiết bị hàng không, Vietnam aviation, VATM",
      },
      en: {
        title: "Home | Air Traffic Technical Company | ATTECH",
        description:
          "ATTECH is one of the leading enterprises in the field of aviation engineering in Vietnam, specializing in providing CNS services, flight inspection and calibration and manufacturing equipment for the aviation industry.",
        keywords:
          "ATTECH, aviation technology, CNS, air traffic management, aviation equipment, Vietnam aviation, VATM",
      },
    };
    return seoContent[currentLanguage] || seoContent.vi;
  }, [currentLanguage]);

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Carousel />
        <Feature />
        <Fact />
        <AlertBox />
        <PartNews />
        <About />
        <Media />
      </Suspense>
    </>
  );
};

export default Home;
