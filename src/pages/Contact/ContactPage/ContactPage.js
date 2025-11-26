import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { submitContactForm } from "../../../services/contactService";
import "../ContactPage/ContactPage.css";
import SEO from "../../../components/SEO/SEO";
import { useI18n } from "../../../hooks/useI18n";

const ContactPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const location = useLocation();

  const seoContent = {
    vi: {
      title: "Trang liên hệ | ATTECH",
      description:
        "Liên hệ với ATTECH để được tư vấn về các giải pháp kỹ thuật hàng không, dịch vụ CNS và bay kiểm tra hiệu chuẩn.",
      keywords:
        "liên hệ ATTECH, contact ATTECH, tư vấn hàng không, aviation consulting",
    },
    en: {
      title: "Contact | ATTECH",
      description:
        "Contact ATTECH for consultation on aviation technical solutions, CNS services and flight inspection calibration.",
      keywords:
        "contact ATTECH, aviation consulting, CNS services, flight inspection",
    },
  };

  const currentSEO = seoContent[currentLanguage] || seoContent.vi;

  // State cho form
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  // State cho lỗi
  const [errors, setErrors] = useState({});
  // State cho thông báo
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(""); // 'success' hoặc 'error'
  // State cho loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear lỗi khi user sửa
  };

  // Validate email
  const validateEmail = (email) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  // Validate phone
  const validatePhone = (phone) =>
    /^[\d\s\+\-\(\)]{8,15}$/.test(phone.replace(/\s/g, ""));

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.name.trim())
      newErrors.name = t("frontend.contact.form.nameRequired");
    if (!form.email.trim())
      newErrors.email = t("frontend.contact.form.emailRequired");
    else if (!validateEmail(form.email))
      newErrors.email = t("frontend.contact.form.emailInvalid");
    if (!form.phone.trim())
      newErrors.phone = t("frontend.contact.form.phoneRequired");
    else if (!validatePhone(form.phone))
      newErrors.phone = t("frontend.contact.form.phoneInvalid");
    if (!form.subject.trim())
      newErrors.subject = t("frontend.contact.form.subjectRequired");
    if (!form.message.trim())
      newErrors.message = t("frontend.contact.form.messageRequired");

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Gửi form đến server
        const result = await submitContactForm(form);

        // Hiển thị thông báo thành công
        setNotification(
          result.message || t("frontend.contact.form.successMessage")
        );
        setNotificationType("success");

        // Reset form sau khi gửi thành công
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });

        // Ẩn thông báo sau 5s
        setTimeout(() => {
          setNotification("");
          setNotificationType("");
        }, 5000);
      } catch (error) {
        // Hiển thị thông báo lỗi
        setNotification(error.message || "Có lỗi xảy ra khi gửi liên hệ");
        setNotificationType("error");

        // Ẩn thông báo lỗi sau 5s
        setTimeout(() => {
          setNotification("");
          setNotificationType("");
        }, 5000);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Không hiển thị alert ở trên cùng khi có lỗi nhập liệu
      setNotification("");
      setNotificationType("");
    }
  };

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={location.pathname}
        lang={currentLanguage}
      />
      <section className="contact" id="contact">
        <div className="container">
          <div className="heading text-center">
            <h2>{t("frontend.contact.title")}</h2>
            <p>{t("frontend.contact.description")}</p>
          </div>
          {/* Thông báo dạng toast nổi, không làm nhảy layout */}
          {notification && (
            <div
              className={`attech-toast ${
                notificationType === "error" ? "attech-toast-error" : ""
              }`}
            >
              {notification}
            </div>
          )}
          <div className="row">
            <div className="col-md-5">
              <div className="title">
                <h3>{t("frontend.contact.details.title")}</h3>
              </div>
              <div className="content">
                <div className="info">
                  <i className="fas fa-mobile-alt"></i>
                  <h4 className="d-inline-block">
                    {t("frontend.contact.details.phone")}:
                    <br />
                    <span>(+84.24) 38271914</span>
                  </h4>
                </div>
                <div className="info">
                  <i className="fas fa-fax"></i>
                  <h4 className="d-inline-block">
                    {t("frontend.contact.details.fax")}:
                    <br />
                    <span>(+84.24) 38271914</span>
                  </h4>
                </div>
                <div className="info">
                  <i className="far fa-envelope"></i>
                  <h4 className="d-inline-block">
                    {t("frontend.contact.details.email")}:
                    <br />
                    <span>attech@attech.com.vn</span>
                  </h4>
                </div>
                <div className="info">
                  <i className="fas fa-map-marker-alt"></i>
                  <h4 className="d-inline-block">
                    {t("frontend.contact.details.address")}:
                    <br />
                    <span>
                      Số 5/200 đường Nguyễn Sơn, phường Bồ Đề, Thành phố Hà Nội
                    </span>
                  </h4>
                </div>
              </div>
            </div>

            <div className="col-md-7">
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className={`form-control${
                        errors.name ? " input-error" : ""
                      }`}
                      placeholder={t("frontend.contact.form.namePlaceholder")}
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    <span className="form-error-google">
                      {errors.name || "\u00A0"}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="email"
                      className={`form-control${
                        errors.email ? " input-error" : ""
                      }`}
                      placeholder={t("frontend.contact.form.emailPlaceholder")}
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                    <span className="form-error-google">
                      {errors.email || "\u00A0"}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="tel"
                      className={`form-control${
                        errors.phone ? " input-error" : ""
                      }`}
                      placeholder={t("frontend.contact.form.phonePlaceholder")}
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    <span className="form-error-google">
                      {errors.phone || "\u00A0"}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className={`form-control${
                        errors.subject ? " input-error" : ""
                      }`}
                      placeholder={t(
                        "frontend.contact.form.subjectPlaceholder"
                      )}
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    />
                    <span className="form-error-google">
                      {errors.subject || "\u00A0"}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    className={`form-control${
                      errors.message ? " input-error" : ""
                    }`}
                    rows="5"
                    id="comment"
                    placeholder={t("frontend.contact.form.messagePlaceholder")}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                  ></textarea>
                  <span className="form-error-google">
                    {errors.message || "\u00A0"}
                  </span>
                </div>
                <button
                  className="btn btn-block"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>{" "}
                      {t("frontend.contact.form.submitButton") || "Đang gửi..."}
                    </>
                  ) : (
                    t("frontend.contact.form.submitButton")
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
