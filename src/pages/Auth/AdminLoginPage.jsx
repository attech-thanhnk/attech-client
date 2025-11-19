import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";

const AdminLoginPage = () => {
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

  const from = location.state?.from?.pathname || "/admin";

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: "" }));
    }
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const handleInputChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    if (!captchaToken) {
      newErrors.captcha = "Vui lòng xác nhận bạn không phải là Robot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        // Redirect to admin panel
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
      setErrors({ general: "Đã xảy ra lỗi. Vui lòng thử lại." });
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
            <div className="company-logo">
              <i className="bi bi-shield-check"></i>
            </div>
            <h1>Đăng nhập quản trị</h1>
            <p>Admin Panel - Chào mừng quản trị viên</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle"></i>
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label>Tên đăng nhập quản trị</label>
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
                  placeholder="Nhập tên đăng nhập admin"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <div className="invalid-feedback">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label>Mật khẩu quản trị</label>
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
                  placeholder="Nhập mật khẩu admin"
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
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Đăng nhập quản trị</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="back-to-home">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => navigate("/")}
              >
                <i className="bi bi-arrow-left"></i>
                Quay về trang chủ
              </button>
            </div>

            <div className="switch-login">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/dang-nhap")}
              >
                <i className="bi bi-person"></i>
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
