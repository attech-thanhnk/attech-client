import React from "react";
import "../ProductPage/ProductPage.css";
import { Outlet, useLocation } from "react-router-dom";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";

const Product = () => {
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const seoContent = {
    vi: {
      title: "Sản phẩm - ATTECH",
      description:
        "Các sản phẩm thiết bị hàng không của ATTECH, phục vụ cho ngành hàng không tại Việt Nam. Công ty TNHH Kỹ thuật Quản lý bay.",
      keywords:
        "sản phẩm ATTECH, thiết bị hàng không, CNS equipment, aviation products, sản phẩm hàng không",
    },
    en: {
      title: "Products - ATTECH",
      description:
        "ATTECH aviation equipment products serving the aviation industry in Vietnam. Air Traffic Technical Co., Ltd.",
      keywords:
        "ATTECH products, aviation equipment, CNS equipment, aviation products, flight inspection equipment",
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
      <div className="page-product">
        <div className="product-content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Product;
