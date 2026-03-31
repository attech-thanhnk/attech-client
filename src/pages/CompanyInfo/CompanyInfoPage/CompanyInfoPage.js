import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarCompanyInfo from "../components/SidebarCompanyInfo/SidebarCompanyInfo";
import "./CompanyInfoPage.css";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";

const CompanyInfoPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const seoContent = {
    vi: {
      title: "Thông tin Công ty | ATTECH",
      description:
        "Tìm hiểu về ATTECH - lịch sử, cơ cấu tổ chức, ban lãnh đạo, ngành nghề kinh doanh và hệ thống chứng chỉ ISO của Công ty.",
      keywords:
        "thông tin ATTECH, về ATTECH, lịch sử ATTECH, ban lãnh đạo, ISO certification",
    },
    en: {
      title: "Company Info | ATTECH",
      description:
        "Learn about ATTECH - history, organizational structure, leadership, business activities and ISO certification system.",
      keywords:
        "ATTECH info, about ATTECH, ATTECH history, leadership, ISO certification",
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
      <div className="page-company-info">
        <SidebarCompanyInfo
          openSidebar={sidebarOpen}
          setOpenSidebar={setSidebarOpen}
        />
        <div
          className={`company-content ${
            sidebarOpen ? "sidebar-collapsed" : "sidebar-expanded"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default CompanyInfoPage;
