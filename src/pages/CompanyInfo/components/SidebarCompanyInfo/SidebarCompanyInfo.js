import React from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../../../components/Shared/LocalizedLink";
import "./SidebarCompanyInfo.css";

const SidebarCompanyInfo = ({ openSidebar, setOpenSidebar }) => {
  const { currentLanguage } = useI18n();
  const location = useLocation();

  // Navigation items for company info
  const navItems = [
    {
      key: "overview",
      labelVi: "Tổng quan",
      labelEn: "Overview", 
      pathVi: "/thong-tin-cong-ty",
      pathEn: "/en/company",
      icon: "fas fa-building"
    },
    {
      key: "history",
      labelVi: "Lịch sử ra đời",
      labelEn: "History",
      pathVi: "/thong-tin-cong-ty/lich-su-ra-doi", 
      pathEn: "/en/company/history",
      icon: "fas fa-history"
    },
    {
      key: "structure", 
      labelVi: "Cơ cấu tổ chức",
      labelEn: "Structure",
      pathVi: "/thong-tin-cong-ty/co-cau-to-chuc",
      pathEn: "/en/company/structure", 
      icon: "fas fa-sitemap"
    },
    {
      key: "leadership",
      labelVi: "Ban lãnh đạo", 
      labelEn: "Leadership",
      pathVi: "/thong-tin-cong-ty/ban-lanh-dao",
      pathEn: "/en/company/leadership",
      icon: "fas fa-users"
    },
    {
      key: "business",
      labelVi: "Ngành nghề kinh doanh",
      labelEn: "Business", 
      pathVi: "/thong-tin-cong-ty/nganh-nghe-kinh-doanh",
      pathEn: "/en/company/business",
      icon: "fas fa-briefcase"
    },
    {
      key: "iso",
      labelVi: "Hệ thống chứng chỉ ISO",
      labelEn: "ISO Certificates",
      pathVi: "/thong-tin-cong-ty/he-thong-chung-chi-iso", 
      pathEn: "/en/company/iso",
      icon: "fas fa-certificate"
    },
    {
      key: "finance",
      labelVi: "Thông tin tài chính",
      labelEn: "Financial Info",
      pathVi: "/thong-tin-cong-ty/thong-tin-tai-chinh",
      pathEn: "/en/company/finance", 
      icon: "fas fa-chart-line"
    },
    {
      key: "gallery",
      labelVi: "Thư viện công ty", 
      labelEn: "Company Gallery",
      pathVi: "/thong-tin-cong-ty/thu-vien-cong-ty",
      pathEn: "/en/company/gallery",
      icon: "fas fa-images"
    }
  ];

  const isItemActive = (item) => {
    const currentPath = location.pathname;
    const targetPath = currentLanguage === 'vi' ? item.pathVi : item.pathEn;
    return currentPath === targetPath;
  };

  return (
    <div
      className={
        openSidebar ? "sidebar-company-info resize" : "sidebar-company-info"
      }
    >
      <div className="top-sidebar">
        <button onClick={() => setOpenSidebar(!openSidebar)}>
          <i className="fa fa-solid fa-bars"></i>
        </button>
        <div>{!openSidebar && <span>THÔNG TIN CÔNG TY</span>}</div>
        <hr />
      </div>

      <div className="sidebar-nav-items">
        {navItems.map((item) => (
          <LocalizedLink
            key={item.key}
            to={currentLanguage === 'vi' ? item.pathVi : item.pathEn}
            className={`sp-nav-button ${isItemActive(item) ? 'active' : ''}`}
            aria-label={currentLanguage === 'vi' ? item.labelVi : item.labelEn}
          >
            <i className={item.icon} aria-hidden="true"></i>
            <span>{currentLanguage === 'vi' ? item.labelVi : item.labelEn}</span>
          </LocalizedLink>
        ))}
      </div>
    </div>
  );
};

export default SidebarCompanyInfo;
