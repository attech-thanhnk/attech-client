import React, { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import FormModal from "../components/FormModal";
import StaticContentForm from "../components/StaticContentForm";
import LeadershipForm from "../components/LeadershipForm";
import CategoryKeysForm from "../components/CategoryKeysForm";
import { useAuth } from "../../contexts/AuthContext";
import AccessDenied from "../../components/AccessDenied";
import "./StaticContentList.css";

const StaticContentList = () => {
  const { user: currentUser, ROLES } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  // Định nghĩa các trang static cần quản lý
  const staticPages = [
    {
      id: "business",
      titleVi: "Ngành nghề kinh doanh",
      titleEn: "Business Fields",
      translationKey: "frontend.companyInfo.business.fullContent",
      description: "Thông tin về các ngành nghề kinh doanh của công ty",
      route: "/thong-tin-cong-ty/nganh-nghe-kinh-doanh",
    },
    {
      id: "leadership",
      titleVi: "Ban lãnh đạo",
      titleEn: "Leadership Team",
      translationKey: "frontend.companyInfo.leadership.fullContent",
      description: "Giới thiệu về ban lãnh đạo và đội ngũ quản lý",
      route: "/thong-tin-cong-ty/ban-lanh-dao",
    },
    {
      id: "history",
      titleVi: "Lịch sử hình thành",
      titleEn: "Company History",
      translationKey: "frontend.companyInfo.history.fullContent",
      description: "Lịch sử phát triển và các mốc quan trọng của công ty",
      route: "/thong-tin-cong-ty/lich-su-ra-doi",
    },
    {
      id: "iso",
      titleVi: "Hệ thống chứng chỉ ISO",
      titleEn: "ISO Certification System",
      translationKey: "frontend.companyInfo.iso.fullContent",
      description: "Các chứng chỉ ISO và hệ thống quản lý chất lượng",
      route: "/thong-tin-cong-ty/he-thong-chung-chi-iso",
    },
  ];

  const handleEdit = (page) => {
    setEditingContent(page);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingContent(null);
  };

  const handleSuccess = () => {
    handleClose();
    // Không cần reload vì content được quản lý bởi translation system
  };

  const pageActions = (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        className="admin-btn admin-btn-outline-secondary"
        onClick={() => window.location.reload()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#f8f9fa",
          color: "#6c757d",
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
        title="Làm mới danh sách"
      >
        <i className="fas fa-refresh"></i>
        Làm mới
      </button>
    </div>
  );

  // Check permission - Editor and above can manage static content
  console.log('🔐 StaticContentList - Current user:', currentUser);
  console.log('🔐 Required roleId:', '<=', ROLES.EDITOR);
  if (!currentUser || currentUser.roleId > ROLES.EDITOR) {
    return (
      <PageWrapper>
        <AccessDenied
          message="Bạn không có quyền truy cập trang này. Chỉ Editor, Admin và SuperAdmin mới có thể quản lý nội dung tĩnh."
          user={currentUser}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper actions={pageActions}>
      <div className="static-content-list">
        <div className="page-header-section">
          <h1 className="page-title">Quản lý Nội dung Tĩnh</h1>
          <p className="page-description">
            Quản lý các trang nội dung tĩnh của website
          </p>
        </div>

        <div className="static-pages-grid">
          {staticPages.map((page) => (
            <div key={page.id} className="static-page-card">
              <div className="card-header">
                <div className="card-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="card-info">
                  <h3 className="card-title">{page.titleVi}</h3>
                  <p className="card-subtitle">{page.titleEn}</p>
                </div>
              </div>

              <div className="card-body">
                <p className="card-description">{page.description}</p>
                <div className="card-meta">
                  <span className="meta-item">
                    <i className="fas fa-code"></i>
                    <code>{page.translationKey}</code>
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-link"></i>
                    <a
                      href={page.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="route-link"
                    >
                      Xem trang
                    </a>
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleEdit(page)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <i className="fas fa-edit"></i>
                  Chỉnh sửa nội dung
                </button>
              </div>
            </div>
          ))}
        </div>

        {staticPages.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-file-alt fa-3x"></i>
            <h3>Chưa có trang nội dung tĩnh</h3>
            <p>Thêm các trang cần quản lý vào mảng staticPages</p>
          </div>
        )}

        {/* Edit Modal */}
        <FormModal
          show={showModal}
          onClose={handleClose}
          title={`Chỉnh sửa: ${editingContent?.titleVi || ""}`}
          size="xl"
          showActions={false}
        >
          {editingContent && (
            editingContent.id === "leadership" ? (
              <LeadershipForm
                content={editingContent}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            ) : (editingContent.id === "history" || editingContent.id === "iso") ? (
              <CategoryKeysForm
                content={editingContent}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            ) : (
              <StaticContentForm
                content={editingContent}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            )
          )}
        </FormModal>
      </div>
    </PageWrapper>
  );
};

export default StaticContentList;
