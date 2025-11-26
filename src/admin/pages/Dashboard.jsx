import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import AccessDenied from "../../components/AccessDenied";
import { useAuth } from "../../contexts/AuthContext";
import { getRecentActivityLogs } from "../../services/activityLogService";
import "./Dashboard.css";
import "../styles/adminButtons.css";

const Dashboard = () => {
  const { user: currentUser, ROLES } = useAuth();
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getRecentActivityLogs(10);
        if (response && response.data) {
          setActivityLogs(response.data);
        }
      } catch (error) {
        // Silently fail - logs are optional
        setActivityLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    if (currentUser && currentUser.roleId <= ROLES.ADMIN) {
      fetchLogs();
    } else {
      setLogsLoading(false);
    }
  }, [currentUser, ROLES]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type) => {
    const types = {
      user_login: "Đăng nhập",
      security_login_failed: "Đăng nhập thất bại",
      security_captcha_failed: "CAPTCHA thất bại",
    };
    return types[type] || type;
  };

  const getTypeBadgeClass = (type) => {
    if (type === "user_login") return "success";
    if (type?.includes("failed")) return "danger";
    return "secondary";
  };

  // Check access permission
  if (!currentUser || currentUser.roleId > ROLES.EDITOR) {
    // Redirect user role 4 to trang-noi-bo
    if (currentUser && currentUser.roleId === 4) {
      navigate('/trang-noi-bo', { replace: true });
      return null;
    }

    return (
      <PageWrapper>
        <AccessDenied
          message="Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên."
          user={currentUser ? {
            roleId: currentUser.roleId,
            roleName: currentUser.roleName,
            name: currentUser.name,
            username: currentUser.username
          } : null}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="simple-admin-welcome">
        <div className="welcome-header">
          <div className="welcome-icon">
          </div>
          <div className="welcome-content">
            <h1>Trang quản trị hệ thống</h1>
            <p>Quản lý và điều hành các chức năng của hệ thống</p>
            <div className="admin-info">
              <span className="user-role">Vai trò: {currentUser?.roleName || 'Admin'}</span>
              <span className="login-time">Đăng nhập: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        <div className="admin-sections">
          <div className="section-title">
            <h3>Quản lý nội dung</h3>
            <p>Quản lý các nội dung và thông tin trên website</p>
          </div>
          <div className="admin-quick-access-grid">
            <button
              className="admin-quick-btn content"
              onClick={() => navigate("/admin/phonebook")}
            >
              <i className="bi bi-telephone-fill"></i>
              <span>Danh bạ điện thoại</span>
              <small>Quản lý thông tin liên hệ</small>
            </button>

            <button
              className="admin-quick-btn content"
              onClick={() => navigate("/admin/news")}
            >
              <i className="bi bi-newspaper"></i>
              <span>Tin tức</span>
              <small>Đăng và quản lý tin tức</small>
            </button>

            <button
              className="admin-quick-btn content"
              onClick={() => navigate("/admin/notifications")}
            >
              <i className="bi bi-bell"></i>
              <span>Thông báo</span>
              <small>Gửi thông báo tới người dùng</small>
            </button>

            <button
              className="admin-quick-btn content"
              onClick={() => navigate("/admin/contacts")}
            >
              <i className="bi bi-envelope"></i>
              <span>Liên hệ khách hàng</span>
              <small>Xem và trả lời liên hệ</small>
            </button>
          </div>
        </div>

        <div className="admin-sections">
          <div className="section-title">
            <h3>Quản lý hệ thống</h3>
            <p>Cấu hình và quản lý tài khoản, phân quyền</p>
          </div>
          <div className="admin-quick-access-grid">
            <button
              className="admin-quick-btn system"
              onClick={() => navigate("/admin/users")}
            >
              <i className="bi bi-people"></i>
              <span>Người dùng</span>
              <small>Quản lý tài khoản</small>
            </button>

            <button
              className="admin-quick-btn system"
              onClick={() => navigate("/admin/roles")}
            >
              <i className="bi bi-person-badge"></i>
              <span>Phân quyền</span>
              <small>Quản lý vai trò</small>
            </button>

            <button
              className="admin-quick-btn system"
              onClick={() => navigate("/admin/language-content")}
            >
              <i className="bi bi-translate"></i>
              <span>Ngôn ngữ</span>
              <small>Quản lý đa ngôn ngữ</small>
            </button>
          </div>
        </div>

        {/* Activity Log Section - Only for Admin */}
        {currentUser && currentUser.roleId <= ROLES.ADMIN && (
          <div className="admin-sections">
            <div className="section-title">
              <h3>Hoạt động gần đây</h3>
              <p>Theo dõi các hoạt động đăng nhập và bảo mật</p>
            </div>
            <div className="activity-log-container">
              {logsLoading ? (
                <div className="activity-log-loading">
                  <i className="bi bi-arrow-repeat spinning"></i>
                  <span>Đang tải...</span>
                </div>
              ) : activityLogs.length > 0 ? (
                <table className="activity-log-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Loại</th>
                      <th>Nội dung</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{formatDateTime(log.timestamp)}</td>
                        <td>
                          <span className={`log-badge ${getTypeBadgeClass(log.type)}`}>
                            {getTypeLabel(log.type)}
                          </span>
                        </td>
                        <td className="log-message">
                          {log.message?.length > 50
                            ? log.message.substring(0, 50) + "..."
                            : log.message}
                        </td>
                        <td>{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="activity-log-empty">
                  <i className="bi bi-clipboard-data"></i>
                  <span>Chưa có hoạt động nào</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;