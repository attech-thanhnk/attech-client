import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./styles/content-formatting.css";
import LocalizedRoutes from "./routes/LocalizedRoutes";
import { AdminRoutes } from "./admin";
import UserDashboard from "./pages/User/UserDashboard";
import { useLocation } from "react-router-dom";
import ChatWidget from "./components/Shared/ChatWidget/ChatWidget";
import BackToTopButton from "./components/Shared/Navigation/BackToTopButton/BackToTopButton";
import LoadingOverlay from "./components/Shared/LoadingOverlay/LoadingOverlay";
import MaintenancePage from "./components/MaintenancePage/MaintenancePage";
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n, { checkTranslationsVersion } from './i18n';
import { MAINTENANCE_MODE } from './config/maintenanceConfig';

const ScrollToTop = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Immediate scroll without delay for smoother experience
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isUserDashboard = location.pathname === "/trang-noi-bo" || location.pathname === "/en/internal";

  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/trang-noi-bo" element={<UserDashboard />} />
        <Route path="/en/internal" element={<UserDashboard />} />
        <Route path="*" element={<LocalizedRoutes />} />
      </Routes>
      {!isAdminRoute && !isUserDashboard && (
        <>
          {/* <ChatWidget /> */}
          <BackToTopButton scrollThreshold={300} size={40} />
        </>
      )}
    </>
  );
};

const App = () => {
  // Chỉ load 1 lần duy nhất khi app khởi động
  const [isLoading, setIsLoading] = useState(() => {
    // Kiểm tra xem đã load lần đầu chưa
    return !window.__APP_LOADED__;
  });

  useEffect(() => {
    // Đánh dấu app đã load
    if (!window.__APP_LOADED__) {
      // Check and refresh translations if needed
      checkTranslationsVersion();

      // Progressive loading strategy:
      // - Tối thiểu 800ms để tránh flash
      const minLoadingTime = 800;

      const minTimer = setTimeout(() => {
        setIsLoading(false);
        window.__APP_LOADED__ = true; // Đánh dấu đã load
      }, minLoadingTime);

      return () => {
        clearTimeout(minTimer);
      };
    }
  }, []);

  // Kiểm tra maintenance mode - chặn tất cả
  if (MAINTENANCE_MODE.enabled) {
    return (
      <I18nextProvider i18n={i18n}>
        <MaintenancePage />
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <LoadingOverlay isLoading={isLoading} />
            <ScrollToTop>
              <AppContent />
            </ScrollToTop>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </I18nextProvider>
  );
};

export default App;
