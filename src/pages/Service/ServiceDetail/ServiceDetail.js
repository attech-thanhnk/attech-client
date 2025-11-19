import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { useI18n } from "../../../hooks/useI18n";
import * as clientServiceService from "../../../services/clientServiceService";
import LocalizedLink from "../../../components/Shared/LocalizedLink";
import ErrorPage from "../../../components/Shared/ErrorPage";
import SEO from "../../../components/SEO/SEO";
import sanitizeHtml from "sanitize-html";
import { getApiBaseUrl } from "../../../config/apiConfig";
import "./ServiceDetail.css";

// Lazy load heavy components
const ServiceAttachments = lazy(() => import('./components/ServiceAttachments'));

// Optimized sanitization options
const SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "class", "width", "height", "loading"],
    figure: ["class"],
    figcaption: ["class"],
    div: ["style", "class"],
    p: ["style", "class"],
    span: ["style", "class"],
    a: ["href", "target", "rel"]
  },
  allowedStyles: {
    "*": {
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
      "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
      "font-size": [/^\d+(?:px|em|%)$/],
      "font-weight": [/^(?:normal|bold|bolder|lighter|[1-9]00)$/]
    }
  }
};

// Enhanced loading component
const ServiceLoader = () => (
  <div className="service-loader">
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <span className="loader-text">Đang tải dịch vụ...</span>
    </div>
  </div>
);

// Optimized content component
const ServiceContent = React.memo(({ content, sanitizeOptions }) => {
  const sanitizedContent = useMemo(
    () => sanitizeHtml(content || '', sanitizeOptions),
    [content, sanitizeOptions]
  );

  return (
    <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
});

const ServiceDetail = () => {
  const { slug: serviceSlug } = useParams();
  const { t, currentLanguage } = useI18n();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Memoized content getter - moved before early returns
  const displayContent = useMemo(() => {
    if (!service) return '';
    return service.displayContent || (currentLanguage === "vi" ? service.contentVi : service.contentEn);
  }, [service, currentLanguage]);

  // Memoized image URL - moved before early returns
  const imageUrl = useMemo(() => {
    if (!service?.imageUrl) return null;
    return service.imageUrl.startsWith('http') ? service.imageUrl : `${getApiBaseUrl()}${service.imageUrl}`;
  }, [service?.imageUrl]);

  // Memoized attachments check - moved before early returns
  const hasAttachments = useMemo(() => {
    return service?.attachments &&
           (service.attachments.images?.length > 0 || service.attachments.documents?.length > 0);
  }, [service?.attachments]);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        const serviceData = await clientServiceService.getServiceBySlug(serviceSlug);

        if (serviceData) {
          const formattedService = clientServiceService.formatServiceForDisplay(serviceData, currentLanguage);
          setService({ ...serviceData, ...formattedService });
        } else {
          setError("Service not found");
        }
      } catch (err) {setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (serviceSlug) {
      loadService();
    }
  }, [serviceSlug, currentLanguage]);

  if (loading) {
    return <ServiceLoader />;
  }

  if (error || !service) {
    return (
      <ErrorPage
        title="Dịch vụ không tồn tại"
        message="Xin lỗi, dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        suggestions={[
          "Kiểm tra lại đường link",
          "Tìm kiếm dịch vụ khác",
          "Quay lại trang danh sách dịch vụ",
        ]}
        type="service"
        backRoute="HOME"
        backText="Về trang chủ"
        listRoute="SERVICES"
        listText="Xem tất cả dịch vụ"
      />
    );
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      <SEO
        title={service.displayTitle}
        description={service.displayDescription || service.displayTitle}
        keywords={`${service.displayTitle}, dịch vụ, ATTECH, kỹ thuật hàng không`}
        image={imageUrl}
        url={typeof window !== 'undefined' ? window.location.pathname : ''}
        locale={currentLanguage === 'en' ? 'en_US' : 'vi_VN'}
        type="service"
      />
      <div className="service-content-wrap">
        {/* Breadcrumb */}
        <nav className="service-breadcrumb">
          <LocalizedLink routeKey="SERVICES">
            {t("navigation.services")}
          </LocalizedLink>
          <span className="breadcrumb-sep">/</span>
          <span>{service.displayTitle}</span>
        </nav>

      {/* Card chính */}
      <div className="service-detail-card">
        {/* Ảnh đại diện với lazy loading */}
        {imageUrl && (
          <div className="service-detail-imgbox">
            {!imageLoaded && <div className="image-placeholder"></div>}
            <img
              src={imageUrl}
              alt={service.displayTitle}
              className={`service-detail-img ${imageLoaded ? 'loaded' : 'loading'}`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Tiêu đề & mô tả */}
        <h1 className="service-detail-title">{service.displayTitle}</h1>
        <p className="service-detail-desc">{service.displayDescription}</p>
        
        {/* Nội dung chi tiết - Optimized */}
        <ServiceContent content={displayContent} sanitizeOptions={SANITIZE_OPTIONS} />

        {/* Attachments Section - Lazy loaded */}
        {hasAttachments && (
          <Suspense fallback={<div className="attachments-loader">Đang tải tài liệu...</div>}>
            <ServiceAttachments
              attachments={service.attachments}
              currentLanguage={currentLanguage}
            />
          </Suspense>
        )}
        
        {/* Nút quay lại */}
        <div className="service-detail-backwrap">
          <LocalizedLink routeKey="SERVICES" className="service-detail-backbtn">
            <i className="fas fa-arrow-left"></i>{" "}
            {currentLanguage === "vi"
              ? "Quay lại danh sách dịch vụ"
              : "Back to services"}
          </LocalizedLink>
        </div>
      </div>
      </div>
    </>
  );
};

export default ServiceDetail;
