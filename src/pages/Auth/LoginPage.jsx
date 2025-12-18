import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/trang-noi-bo";

  const handleInputChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.username.trim()) {
      newErrors.username = t("auth.login.usernameRequired");
    }

    if (!credentials.password.trim()) {
      newErrors.password = t("auth.login.passwordRequired");
    }

    if (!captchaToken) {
      newErrors.captcha = t("auth.login.captchaRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: "" }));
    }
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login({
        ...credentials,
        recaptchaToken: captchaToken
      });

      if (result.success) {
        // Redirect to user internal page
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error });
        // Reset captcha sau khi đăng nhập thất bại
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
      }
    } catch (error) {
      setErrors({ general: t("auth.login.generalError") });
      // Reset captcha sau khi có lỗi
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{t("auth.login.title")}</h1>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label>{t("auth.login.username")}</label>
              <div className="input-group">
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  placeholder={t("auth.login.usernamePlaceholder")}
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <div className="invalid-feedback">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label>{t("auth.login.password")}</label>
              <div className="input-group">
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="form-group recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                onExpired={handleCaptchaExpired}
              />
              {errors.captcha && (
                <div className="invalid-feedback" style={{ display: 'block' }}>
                  {errors.captcha}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  <span>{t("auth.login.loggingIn")}</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>{t("auth.login.submit")}</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => navigate("/")}
            >
              <i className="bi bi-arrow-left"></i>
              {t("auth.login.backToHome")}
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate("/admin-login")}
            >
              <i className="bi bi-shield-check"></i>
              {t("auth.login.adminLogin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
