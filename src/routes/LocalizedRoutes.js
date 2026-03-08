import React, { useEffect, useTransition } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useI18n } from "../hooks/useI18n";
import { getLanguageFromPath } from "../utils/routeHelpers";
import MainLayout from "../components/Shared/Layout/MainLayout";
import RouteWrapper from "../components/Shared/RouteWrapper/RouteWrapper";
import ProtectedRoute from "../components/Auth/ProtectedRoute";

// Lazy load pages for code splitting
const Home = lazy(() => import("../pages/Home/HomePage/HomePage"));
const Product = lazy(() => import("../pages/Product/ProductPage/ProductPage"));
const ProductList = lazy(() =>
  import("../pages/Product/components/ProductList/ProductList")
);
const ProductDetail = lazy(() =>
  import("../pages/Product/ProductDetail/ProductDetail")
);

const Service = lazy(() => import("../pages/Service/ServicePage/ServicePage"));
const ServiceList = lazy(() =>
  import("../pages/Service/components/ServiceList/ServiceList")
);
const ServiceDetail = lazy(() =>
  import("../pages/Service/ServiceDetail/ServiceDetail")
);

const NewsPage = lazy(() => import("../pages/News/NewsPage/NewsPage"));
const NewsListPage = lazy(() =>
  import("../pages/News/NewsListPage/NewsListPage")
);
const NewsDetailPage = lazy(() =>
  import("../pages/News/NewsDetailPage/NewsDetailPage")
);

const NotificationPage = lazy(() =>
  import("../pages/Notification/NotificationPage/NotificationPage")
);
const NotificationListPage = lazy(() =>
  import("../pages/Notification/NotificationListPage/NotificationListPage")
);
const NotificationDetailPage = lazy(() =>
  import("../pages/Notification/NotificationDetailPage/NotificationDetailPage")
);

const ContactPage = lazy(() =>
  import("../pages/Contact/ContactPage/ContactPage")
);
const Financial = lazy(() =>
  import("../pages/CompanyInfo/components/Financial/Financial")
);
const InformationAnnouncement = lazy(() =>
  import("../pages/CompanyInfo/components/InformationAnnouncement/InformationAnnouncement")
);
const History = lazy(() =>
  import("../pages/CompanyInfo/components/History/History")
);
const Structure = lazy(() =>
  import("../pages/CompanyInfo/components/Structure/Structure")
);
const Leadership = lazy(() =>
  import("../pages/CompanyInfo/components/Leadership/Leadership")
);
const Business = lazy(() =>
  import("../pages/CompanyInfo/components/Business/Business")
);
const Iso = lazy(() => import("../pages/CompanyInfo/components/Iso/Iso"));
const Gallery = lazy(() =>
  import("../pages/CompanyInfo/components/Gallery/Gallery")
);
const GalleryDetail = lazy(() =>
  import("../pages/CompanyInfo/components/Gallery/GalleryDetail")
);
const MediaLibrary = lazy(() =>
  import("../pages/CompanyInfo/components/MediaLibrary/MediaLibrary")
);
const VideoGallery = lazy(() =>
  import("../pages/CompanyInfo/components/VideoGallery/VideoGallery")
);
const CompanyInfoPage = lazy(() =>
  import("../pages/CompanyInfo/CompanyInfoPage/CompanyInfoPage")
);

const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const AdminLoginPage = lazy(() => import("../pages/Auth/AdminLoginPage"));
const UserDashboard = lazy(() => import("../pages/User/UserDashboard"));
const InternalDocuments = lazy(() => import("../pages/User/InternalDocuments"));
const ContactDirectory = lazy(() => import("../pages/User/ContactDirectory"));
const GlobalDocumentSearch = lazy(() => import("../pages/User/GlobalDocumentSearch"));

// Minimal loading component to avoid double loading indicators
const PageLoader = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "20vh", // Smaller height
        opacity: 0.7, // More subtle
      }}
    >
      <div
        style={{
          width: "20px", // Smaller spinner
          height: "20px",
          border: "2px solid #f3f3f3",
          borderTop: "2px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
};

const LocalizedRoutes = () => {
  const location = useLocation();
  const { changeLanguage } = useI18n();
  const [isPending, startTransition] = useTransition();

  // Sync language with URL (only on mount and language-related path changes)
  useEffect(() => {
    const langFromPath = getLanguageFromPath(location.pathname);
    const currentLang = localStorage.getItem("i18nextLng") || "vi";

    // Only change language if it's different from current, and skip redirect
    if (langFromPath !== currentLang) {
      startTransition(() => {
        changeLanguage(langFromPath, true); // Skip redirect to prevent loops
      });
    }
  }, [location.pathname, changeLanguage]);

  // Check if current path is internal system
  const isInternalSystem = location.pathname.startsWith('/trang-noi-bo');

  if (isInternalSystem) {
    // Render internal system with nested routes (sidebar layout fixed)
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/trang-noi-bo"
            element={
              <ProtectedRoute fallbackPath="/dang-nhap">
                <UserDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Dashboard content</div>} />
            <Route path="tim-kiem" element={<GlobalDocumentSearch />} />
            <Route path="danh-ba" element={<ContactDirectory />} />
            <Route path=":category" element={<InternalDocuments />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <MainLayout>
      <Suspense fallback={null}>
        <Routes>
          {/* Vietnamese Routes */}
          <Route path="/" element={<Home />} />

          {/* English Routes - with /en prefix */}
          <Route path="/en" element={<Home />} />
          <Route path="/en/" element={<Home />} />

          {/* Product Routes */}
          {/* Vietnamese */}
          <Route path="/san-pham" element={<Product />}>
            <Route index element={<ProductList />} />
            <Route path=":category" element={<ProductList />} />
          </Route>
          {/* Product detail routes - flat structure with .html suffix */}
          <Route
            path="/san-pham/:slug.html"
            element={
              <RouteWrapper>
                <ProductDetail />
              </RouteWrapper>
            }
          />
          {/* English */}
          <Route path="/en/products" element={<Product />}>
            <Route index element={<ProductList />} />
            <Route path=":category" element={<ProductList />} />
          </Route>
          {/* Product detail routes - flat structure with .html suffix */}
          <Route
            path="/en/products/:slug.html"
            element={
              <RouteWrapper>
                <ProductDetail />
              </RouteWrapper>
            }
          />

          {/* Service Routes */}
          {/* Vietnamese */}
          <Route path="/dich-vu" element={<Service />}>
            <Route index element={<ServiceList />} />
          </Route>
          {/* Service detail routes - flat structure with .html suffix */}
          <Route
            path="/dich-vu/:slug.html"
            element={
              <RouteWrapper>
                <ServiceDetail />
              </RouteWrapper>
            }
          />
          {/* English */}
          <Route path="/en/services" element={<Service />}>
            <Route index element={<ServiceList />} />
          </Route>
          {/* Service detail routes - flat structure with .html suffix */}
          <Route
            path="/en/services/:slug.html"
            element={
              <RouteWrapper>
                <ServiceDetail />
              </RouteWrapper>
            }
          />

          {/* News Routes */}
          {/* Vietnamese */}
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/tin-tuc/tat-ca" element={<NewsListPage />} />
          {/* News category list routes - clean URLs without .html */}
          <Route
            path="/tin-tuc/:parent/:category"
            element={
              <RouteWrapper>
                <NewsListPage />
              </RouteWrapper>
            }
          />
          <Route
            path="/tin-tuc/:category"
            element={
              <RouteWrapper>
                <NewsListPage />
              </RouteWrapper>
            }
          />
          {/* News detail routes - flat structure with .html suffix */}
          <Route
            path="/tin-tuc/:slug.html"
            element={
              <RouteWrapper>
                <NewsDetailPage />
              </RouteWrapper>
            }
          />
          {/* English */}
          <Route path="/en/news" element={<NewsPage />} />
          <Route path="/en/news/all" element={<NewsListPage />} />
          {/* News category list routes - clean URLs without .html */}
          <Route
            path="/en/news/:parent/:category"
            element={
              <RouteWrapper>
                <NewsListPage />
              </RouteWrapper>
            }
          />
          <Route
            path="/en/news/:category"
            element={
              <RouteWrapper>
                <NewsListPage />
              </RouteWrapper>
            }
          />
          {/* News detail routes - flat structure with .html suffix */}
          <Route
            path="/en/news/:slug.html"
            element={
              <RouteWrapper>
                <NewsDetailPage />
              </RouteWrapper>
            }
          />

          {/* Notification Routes */}
          {/* Vietnamese */}
          <Route path="/thong-bao" element={<NotificationPage />} />
          <Route
            path="/thong-bao/:category"
            element={<NotificationListPage />}
          />
          {/* Notification detail routes - flat structure with .html suffix */}
          <Route
            path="/thong-bao/:slug.html"
            element={
              <RouteWrapper>
                <NotificationDetailPage />
              </RouteWrapper>
            }
          />
          {/* English */}
          <Route path="/en/notifications" element={<NotificationPage />} />
          <Route
            path="/en/notifications/:category"
            element={<NotificationListPage />}
          />
          {/* Notification detail routes - flat structure with .html suffix */}
          <Route
            path="/en/notifications/:slug.html"
            element={
              <RouteWrapper>
                <NotificationDetailPage />
              </RouteWrapper>
            }
          />

          {/* Company Info Routes - Nested with sidebar layout */}
          {/* Vietnamese */}
          <Route path="/thong-tin-cong-ty" element={<CompanyInfoPage />}>
            <Route index element={<Financial documentType="financial" />} />
            <Route path="cong-bo-thong-tin" element={<InformationAnnouncement />} />
            <Route path="thong-tin-tai-chinh" element={<Financial documentType="financial" />} />
            <Route path="thong-tin-khac" element={<Financial documentType="other" />} />
            <Route path="lich-su-ra-doi" element={<History />} />
            <Route path="co-cau-to-chuc" element={<Structure />} />
            <Route path="ban-lanh-dao" element={<Leadership />} />
            <Route path="nganh-nghe-kinh-doanh" element={<Business />} />
            <Route path="he-thong-chung-chi-iso" element={<Iso />} />
            <Route path="thu-vien-cong-ty" element={<MediaLibrary />} />
            <Route path="thu-vien-anh" element={<Gallery />} />
            <Route
              path="thu-vien-anh/:slug"
              element={
                <RouteWrapper>
                  <GalleryDetail />
                </RouteWrapper>
              }
            />
            <Route path="thu-vien-video" element={<VideoGallery />} />
          </Route>
          {/* English */}
          <Route path="/en/company" element={<CompanyInfoPage />}>
            <Route index element={<Financial documentType="financial" />} />
            <Route path="information-announcement" element={<InformationAnnouncement />} />
            <Route path="financial" element={<Financial documentType="financial" />} />
            <Route path="other-info" element={<Financial documentType="other" />} />
            <Route path="history" element={<History />} />
            <Route path="structure" element={<Structure />} />
            <Route path="leadership" element={<Leadership />} />
            <Route path="business" element={<Business />} />
            <Route path="iso" element={<Iso />} />
            <Route path="gallery" element={<MediaLibrary />} />
            <Route path="photos" element={<Gallery />} />
            <Route
              path="photos/:slug"
              element={
                <RouteWrapper>
                  <GalleryDetail />
                </RouteWrapper>
              }
            />
            <Route path="videos" element={<VideoGallery />} />
          </Route>

          {/* Contact Routes */}
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/en/contact" element={<ContactPage />} />

          {/* Login Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/en/login" element={<LoginPage />} />

          {/* Admin Login Routes */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/en/admin-login" element={<AdminLoginPage />} />

          {/* User Dashboard Routes - Outside MainLayout */}
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

export default LocalizedRoutes;
