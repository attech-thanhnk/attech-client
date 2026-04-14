import { useParams, useLocation } from "react-router-dom";
import NewsSection from "../components/NewsSection/NewsSection";
import TrendingArea from "../components/TrendingArea/TrendingArea";
import WeeklyNews from "../components/WeeklyNews/WeeklyNews";
import "./NewsPage.css";
import WhatsNews from "../components/WhatsNews/WhatsNews";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";

const NewsPage = () => {
  const { category } = useParams();
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const seoContent = {
    vi: {
      title: "Trang tin tức",
      description:
        "Cập nhật tin tức mới nhất về các hoạt động, sự kiện, thông tin trong lĩnh vực hàng không của Công ty TNHH Kỹ thuật Quản lý bay",
      keywords:
        "tin tức ATTECH, tin hàng không, aviation news, hoạt động ATTECH",
    },
    en: {
      title: "News",
      description:
        "Latest news about ATTECH and Vietnam aviation industry, activities, events and professional information.",
      keywords:
        "ATTECH news, aviation news, aviation activities, ATTECH updates",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="news-page">
        <div className="news-container">
          <NewsSection />
          <TrendingArea category="activities" />
          <WeeklyNews />
          <WhatsNews />
        </div>
      </div>
    </>
  );
};

export default NewsPage;
