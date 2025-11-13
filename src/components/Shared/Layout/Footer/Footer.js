import { useTranslation } from "react-i18next";
import "../Footer/Footer.css";
import { useI18n } from "../../../../hooks/useI18n";
import LocalizedLink from "../../LocalizedLink/LocalizedLink";
import MapComponent from "../../MapComponent/MapComponent";

const Footer = () => {
  const { t: useTranslationT } = useTranslation();
  const { t, currentLanguage } = useI18n();

  return (
    <div className="footer wow fadeIn" data-wow-delay="0.3s">
      <div className="container">
        <div className="company-footer text-center mb-4">
          <h2 className="company-name">
            {useTranslationT("frontend.company.name")}
          </h2>
          <h3 className="company-name-en">
            {useTranslationT("frontend.company.nameSecondary")}
          </h3>
        </div>
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="footer-contact">
              <p className="footer-title">
                {useTranslationT("footer.contactTitle")}
              </p>
              <div className="footer-contact-info">
                <p>
                  <i className="fa fa-map-marker-alt"></i>
                  <span>{useTranslationT("footer.address")}</span>
                </p>
                <p>
                  <i className="fa fa-phone-alt"></i>
                  <span>
                    {useTranslationT("footer.phoneLabel")}:{" "}
                    {useTranslationT("footer.phone")}
                  </span>
                </p>
                <p>
                  <i className="fa fa-fax"></i>
                  <span>
                    {useTranslationT("footer.faxLabel")}:{" "}
                    {useTranslationT("footer.fax")}
                  </span>
                </p>
                <p>
                  <i className="fa fa-envelope"></i>
                  <span>{useTranslationT("footer.email")}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-4">
            <div className="footer-links">
              <p className="footer-title">
                {useTranslationT("footer.quickLinks")}
              </p>
              <div className="links-list">
                <p>
                  <a
                    href="https://moc.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://moc.gov.vn/
                  </a>
                </p>
                <p>
                  <a
                    href="https://caa.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://caa.gov.vn/
                  </a>
                </p>
                <p>
                  <a
                    href="https://vatm.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://vatm.vn/
                  </a>
                </p>
                <p>
                  <a
                    href="https://baoxaydung.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://baoxaydung.vn/
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <div className="newsletter">
              <p className="footer-title">
                {useTranslationT("footer.mapTitle")}
              </p>
              <div className="map-wrapper">
                <MapComponent lat={21.041648} lng={105.880894} zoom={15} height="180px" />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-social mt-4"></div>
        <div className="copyright mt-4">
          <div className="copyright-text">
            © <a href="#">2025. {useTranslationT("footer.copyright")}</a>
            <span className="mx-2">|</span>
            <LocalizedLink routeKey="HOME">
              {useTranslationT("navigation.home")}
            </LocalizedLink>
            <span className="mx-2">|</span>
            <LocalizedLink routeKey="CONTACT">
              {useTranslationT("navigation.contact")}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
