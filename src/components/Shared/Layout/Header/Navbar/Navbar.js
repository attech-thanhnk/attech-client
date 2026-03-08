import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import "./Navbar.css";
import "./Navbar.mobile.css";
import MenuItems from "./menuItemsComponent";
import useIsMobile from "./useIsMobile";
import { useI18n } from "../../../../../hooks/useI18n";
import { useTheme } from "../../../../../contexts/ThemeContext";
import { useAuth } from "../../../../../contexts/AuthContext";
import { useClickOutside } from "../../../../../hooks/useClickOutside";
import LocalizedLink from "../../../LocalizedLink/LocalizedLink";
import debounce from "lodash/debounce";
import GlobalSearch from "../../../GlobalSearch/GlobalSearch";
import useMenuData from "../../../../../hooks/useMenuData";
import { useBannerSettings } from "../../../../../hooks/useBannerSettings";

const SCROLL_THRESHOLD = 50;
const MOBILE_BREAKPOINT = 1024;

const useGlobalSearch = () => {
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const handleGlobalSearchOpen = useCallback(() => {
    setIsGlobalSearchOpen(true);
  }, []);

  const handleGlobalSearchClose = useCallback(() => {
    setIsGlobalSearchOpen(false);
  }, []);

  return {
    isGlobalSearchOpen,
    handleGlobalSearchOpen,
    handleGlobalSearchClose,
  };
};

const NavbarTop = ({
  closeMobileMenu,
  isGlobalSearchOpen,
  handleGlobalSearchOpen,
  handleGlobalSearchClose,
  isDarkMode,
  toggleDarkMode,
  language,
  handleLanguageSwitch,
  translate,
  isMobile,
  mobileOpen,
  toggleMobileMenu,
  menuData: rawMenuData,
  logoUrl,
  user,
}) => {
  const mobileMenuRef = useRef(null);


  useClickOutside(mobileMenuRef, (event) => {
    if (mobileOpen) {
      closeMobileMenu();
    }
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && mobileOpen) {
        closeMobileMenu();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, closeMobileMenu]);

  return (
    <div className="navbar-top">
      <div className="navbar-container">
        <div className="navbar-left">
          <LocalizedLink
            routeKey="HOME"
            className="logo"
            onClick={closeMobileMenu}
            aria-label="Trang chủ"
          >
            <img
              src={logoUrl}
              alt="ATTECH Logo"
              loading="eager"
            />
          </LocalizedLink>
        </div>
        <div className="navbar-right">
          <button
            className="navbar-toggle"
            onClick={toggleMobileMenu}
            aria-label={language === "vi" ? "Mở menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-icon" aria-hidden="true">☰</span>
          </button>
          <div className="desktop-controls">
            <button
              className="search-button"
              onClick={handleGlobalSearchOpen}
              aria-label={language === "vi" ? "Tìm kiếm" : "Search"}
              title={language === "vi" ? "Tìm kiếm toàn cục" : "Global Search"}
            >
              <i className="fa fa-search"></i>
            </button>
            <div className="language-switcher">
              <button
                className={`lang-btn ${language === "vi" ? "active" : ""}`}
                onClick={handleLanguageSwitch("vi")}
                title="Tiếng Việt"
                aria-pressed={language === "vi"}
              >
                <img
                  src={require("../../../../../assets/img/flags/vi.png")}
                  alt="Tiếng Việt"
                />
              </button>
              <button
                className={`lang-btn ${language === "en" ? "active" : ""}`}
                onClick={handleLanguageSwitch("en")}
                title="English"
                aria-pressed={language === "en"}
              >
                <img
                  src={require("../../../../../assets/img/flags/eng.png")}
                  alt="English"
                />
              </button>
            </div>
            {user ? (
              <Link
                to="/trang-noi-bo"
                className="internal-page-btn"
                title={language === "vi" ? "Trang nội bộ" : "Internal Page"}
              >
                <span>{language === "vi" ? "Trang nội bộ" : "Internal"}</span>
              </Link>
            ) : (
              <LocalizedLink
                routeKey="LOGIN"
                className="login-btn"
                title={language === "vi" ? "Đăng nhập" : "Login"}
                aria-label={language === "vi" ? "Đăng nhập" : "Login"}
              >
                <i className="fa fa-solid fa-user"></i>
              </LocalizedLink>
            )}
          </div>
          <div
            className={`mobile-menu${mobileOpen ? " open" : ""}`}
            id="mobile-menu"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label={language === "vi" ? "Menu di động" : "Mobile menu"}
          >
            <div className="mobile-menu-header">
              <LocalizedLink
                routeKey="HOME"
                className="logo"
                onClick={closeMobileMenu}
                aria-label="Trang chủ"
              >
                <img
                  src={logoUrl}
                  alt="ATTECH Logo"
                />
              </LocalizedLink>
              <button
                className="close-menu"
                onClick={closeMobileMenu}
                aria-label={language === "vi" ? "Đóng menu" : "Close menu"}
              >
                ×
              </button>
            </div>
            <div className="mobile-menu-content">
              <div className="mobile-menu-footer">
                <div className="mobile-search">
                  <button
                    className="mobile-search-button"
                    onClick={handleGlobalSearchOpen}
                    aria-label={language === "vi" ? "Tìm kiếm toàn cục" : "Global Search"}
                  >
                    <i className="fa fa-search"></i>
                    <span>{language === "vi" ? "Tìm kiếm..." : "Search..."}</span>
                  </button>
                </div>
                <div className="mobile-actions">
                  <div className="language-switcher">
                    <button
                      className={`lang-btn ${language === "vi" ? "active" : ""
                        }`}
                      onClick={handleLanguageSwitch("vi")}
                      title="Tiếng Việt"
                      aria-pressed={language === "vi"}
                    >
                      <img
                        src={require("../../../../../assets/img/flags/vi.png")}
                        alt="Tiếng Việt"
                      />
                    </button>
                    <button
                      className={`lang-btn ${language === "en" ? "active" : ""
                        }`}
                      onClick={handleLanguageSwitch("en")}
                      title="English"
                      aria-pressed={language === "en"}
                    >
                      <img
                        src={require("../../../../../assets/img/flags/eng.png")}
                        alt="English"
                      />
                    </button>
                  </div>
                  {user ? (
                    <Link
                      to="/trang-noi-bo"
                      className="internal-page-btn"
                      title={language === "vi" ? "Trang nội bộ" : "Internal Page"}
                      onClick={closeMobileMenu}
                    >
                      <i className="fa fa-solid fa-building"></i>
                      <span>{language === "vi" ? "Nội bộ" : "Internal"}</span>
                    </Link>
                  ) : (
                    <LocalizedLink
                      routeKey="LOGIN"
                      className="login-btn"
                      title={language === "vi" ? "Đăng nhập" : "Login"}
                      aria-label={language === "vi" ? "Đăng nhập" : "Login"}
                      onClick={closeMobileMenu}
                    >
                      <i className="fa fa-solid fa-user login-user"></i>
                    </LocalizedLink>
                  )}
                </div>
              </div>
              <nav>
                <ul
                  className="mobile-nav-items"
                  role="menu"
                  key={`mobile-menu-${language}`}
                >
                  <MenuItems
                    menuItems={rawMenuData}
                    isMobile={true}
                    closeMobileMenu={closeMobileMenu}
                  />
                </ul>
              </nav>
            </div>
          </div>
          <div
            className={`mobile-menu-backdrop${mobileOpen ? " open" : ""}`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

const NavbarBottom = ({
  mobileOpen,
  toggleMobileMenu,
  isMobile,
  closeMobileMenu,
  language,
  menuData: rawMenuData,
}) => (
  <div className="navbar-menu-wrapper">
    <div className="navbar-container">
      <button
        className="navbar-toggle"
        onClick={toggleMobileMenu}
        aria-label={language === "vi" ? "Mở menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="main-menu"
      >
        ☰
      </button>
      <ul
        className="nav-menu"
        id="main-menu"
        role="menubar"
        key={`navbar-menu-${language}`} // Force re-render with language
      >
        <MenuItems
          menuItems={rawMenuData}
          isMobile={false}
          closeMobileMenu={closeMobileMenu}
        />
      </ul>
    </div>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const isHomePage =
    location.pathname === "/" ||
    location.pathname === "/en" ||
    location.pathname === "/en/";

  // Initialize scrolled based on page - prevents jump on load
  const [scrolled, setScrolled] = useState(() => !isHomePage || window.scrollY > SCROLL_THRESHOLD);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  const { currentLanguage, changeLanguage } = useI18n();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const {
    isGlobalSearchOpen,
    handleGlobalSearchOpen,
    handleGlobalSearchClose,
  } = useGlobalSearch();
  const { rawMenuData, loading: menuLoading } = useMenuData(currentLanguage);
  const { getBannerUrl } = useBannerSettings();

  // Get logo URL from API, fallback to local if not available
  const logoUrl = getBannerUrl('Logo') || '/assets/images/header/attech-bo-cuc-dau-trang-chu.png';

  // Debug menu data

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }
    const handleScroll = debounce(
      () => setScrolled(window.scrollY > SCROLL_THRESHOLD),
      100
    );
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      handleScroll.cancel();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100vh";
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
      document.body.style.height = "auto";
      document.body.classList.remove("mobile-menu-open");
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
      document.body.style.height = "auto";
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleLanguageSwitch = useCallback(
    (targetLang) => () => {
      changeLanguage(targetLang);
    },
    [changeLanguage]
  );

  return (
    <nav
      className={`navbar${scrolled ? " scrolled" : ""}`}
      role="navigation"
      aria-label="Điều hướng chính"
    >
      <NavbarTop
        closeMobileMenu={closeMobileMenu}
        isGlobalSearchOpen={isGlobalSearchOpen}
        handleGlobalSearchOpen={handleGlobalSearchOpen}
        handleGlobalSearchClose={handleGlobalSearchClose}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        language={currentLanguage}
        handleLanguageSwitch={handleLanguageSwitch}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        toggleMobileMenu={toggleMobileMenu}
        menuData={rawMenuData}
        logoUrl={logoUrl}
        user={user}
      />
      <NavbarBottom
        mobileOpen={mobileOpen}
        toggleMobileMenu={toggleMobileMenu}
        isMobile={false}
        closeMobileMenu={closeMobileMenu}
        language={currentLanguage}
        menuData={rawMenuData}
      />
      <GlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={handleGlobalSearchClose}
      />
    </nav>
  );
};

// Remove memo to ensure Navbar updates immediately on language change
export default Navbar;
