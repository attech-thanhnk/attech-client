import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { changePassword } from "../services/authService";
import "./AccountModal.css";

const AccountModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, type: "", text: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${window.scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const body = document.body;
      const scrollY = body.style.top;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup on unmount
    return () => {
      const body = document.body;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
    }

    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    setMessage({ show: false, type: "", text: "" });

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.success) {
        setMessage({
          show: true,
          type: "success",
          text: "Đổi mật khẩu thành công!",
        });

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      } else {
        setMessage({
          show: true,
          type: "error",
          text: result.message || "Đổi mật khẩu thất bại",
        });
      }
    } catch (error) {
      setMessage({
        show: true,
        type: "error",
        text: error.message || "Có lỗi xảy ra khi đổi mật khẩu",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setActiveTab("profile");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setMessage({ show: false, type: "", text: "" });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="account-modal-overlay" onClick={handleClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quản lý tài khoản</h3>
          <button className="close-btn" onClick={handleClose}>
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Thông tin tài khoản
          </button>
          <button
            className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            Đổi mật khẩu
          </button>
        </div>

        <div className="modal-content">
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="user-details">
                <div className="detail-item">
                  <label>Tên đăng nhập:</label>
                  <span>{user?.username}</span>
                </div>
                <div className="detail-item">
                  <label>Họ và tên:</label>
                  <span>{user?.name || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{user?.email || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item">
                  <label>Vai trò:</label>
                  <span>{user?.roleName}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span className="status active">Hoạt động</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="password-section">
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    className={errors.currentPassword ? "error" : ""}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  {errors.currentPassword && (
                    <span className="error-text">{errors.currentPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className={errors.newPassword ? "error" : ""}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  {errors.newPassword && (
                    <span className="error-text">{errors.newPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className={errors.confirmPassword ? "error" : ""}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>

                {message.show && (
                  <div className={`message ${message.type}`}>
                    <i
                      className={`bi ${
                        message.type === "success"
                          ? "bi-check-circle"
                          : "bi-exclamation-circle"
                      }`}
                    ></i>
                    {message.text}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Đổi mật khẩu
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
