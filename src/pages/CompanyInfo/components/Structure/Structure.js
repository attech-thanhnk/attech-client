import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "../Structure/Structure.css";
import SEO from "../../../../components/SEO/SEO";
import { useI18n } from "../../../../hooks/useI18n";
import { useBannerSettings } from "../../../../hooks/useBannerSettings";

export default function Structure() {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();
  const { getStructureChart } = useBannerSettings();

  const seoContent = {
    vi: {
      title: "Cơ cấu tổ chức | ATTECH",
      description:
        "Xem cơ cấu tổ chức và sơ đồ bộ máy quản lý của ATTECH, công ty kỹ thuật quản lý bay hàng đầu Việt Nam.",
      keywords:
        "cơ cấu tổ chức ATTECH, sơ đồ tổ chức, organizational structure, company structure",
    },
    en: {
      title: "Organizational Structure | ATTECH",
      description:
        "View the organizational structure and management chart of ATTECH, Vietnam's leading air traffic technical company.",
      keywords:
        "ATTECH organizational structure, company structure, management chart",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;
  const structureChartUrl = getStructureChart();

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <div className="structure-background">
        <div className="structure">
          <h2>{t("frontend.companyInfo.structure.title")}</h2>
          <img
            src={structureChartUrl || "/assets/images/structure/attech-structure.svg"}
            alt={t("frontend.companyInfo.structure.altText")}
          />
        </div>
      </div>
    </>
  );
}
