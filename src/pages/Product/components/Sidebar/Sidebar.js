import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../../hooks/useI18n";
import menuItems from "../../../../components/Shared/Layout/Header/Navbar/menuItem";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useI18n();
  const isEnglish = currentLanguage === "en";
  const labelKey = isEnglish ? "labelEn" : "labelVi";
  const pathKey = isEnglish ? "pathEn" : "pathVi";

  const productMenu = menuItems.find((item) => item.key === "products");
  const categories = (productMenu?.submenu || []).filter((item) => {
    const label = item?.[labelKey];
    const path = item?.[pathKey];

    return (
      typeof label === "string" &&
      label.trim() !== "" &&
      typeof path === "string" &&
      path.trim() !== ""
    );
  });

  const renderMenuItem = (item, index) => {
    const label = item[labelKey];
    const path = item[pathKey];
    const key = item.key || path || index;
    const isExternalLink = /^https?:\/\//i.test(path);

    if (isExternalLink) {
      return (
        <a
          key={key}
          href={path}
          className="menu-item"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          <span className="menu-text">{label}</span>
        </a>
      );
    }

    return (
      <Link to={path} key={key} className="menu-item" onClick={onClose}>
        <span className="menu-text">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className={`product-sidebar${isOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <h3>{t("admin.products.categories")}</h3>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="sidebar-content">
          <nav className="sidebar-nav">{categories.map(renderMenuItem)}</nav>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;