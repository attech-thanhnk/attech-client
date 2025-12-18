import React from "react";
import "../ServicePage/ServicePage.css";
import { Outlet, useLocation } from "react-router-dom";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";

const Service = () => {
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const seoContent = {
    vi: {
      title: "Dịch vụ | ATTECH",
      description:
        "ATTECH cung cấp dịch vụ CNS chuyên nghiệp, bay kiểm tra hiệu chuẩn thiết bị hàng không và các giải pháp kỹ thuật hàng không.",
      keywords:
        "dịch vụ ATTECH, CNS services, flight inspection, aviation services, bay kiểm tra",
    },
    en: {
      title: "Services | ATTECH",
      description:
        "ATTECH provides professional CNS services, flight inspection calibration and aviation technical solutions.",
      keywords:
        "ATTECH services, CNS services, flight inspection, aviation services",
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
      <div className="page-service">
        <div className="service-content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Service;
