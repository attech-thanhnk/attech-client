import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { tinymceConfig } from "../../config/tinymceConfig";
import staticContentService from "../../services/staticContentService";
import "./StaticContentForm.css";

const StaticContentForm = ({ content, onSuccess, onCancel }) => {
  const [contentVi, setContentVi] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [activeTab, setActiveTab] = useState("vi");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Load current content from translation
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoadingInitial(true);
        const data = await staticContentService.getContent(
          content.translationKey
        );
        setContentVi(data.vi || "");
        setContentEn(data.en || "");
      } catch (error) {
        showToast("Lỗi tải nội dung", "error");
      } finally {
        setLoadingInitial(false);
      }
    };

    if (content) {
      loadContent();
    }
  }, [content]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await staticContentService.updateContent(content.translationKey, {
        vi: contentVi,
        en: contentEn,
      });

      showToast("Cập nhật thành công!", "success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (error) {
      showToast("Lỗi cập nhật nội dung", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="static-content-form">
        <div className="loading-state">
          <div className="spinner-border" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p>Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="static-content-form">
      {/* Toast */}
      {toast.show && (
        <div className={`toast-message toast-${toast.type}`}>
          <i
            className={`fas fa-${
              toast.type === "success" ? "check-circle" : "exclamation-circle"
            }`}
          ></i>
          {toast.message}
        </div>
      )}

      {/* Language Tabs */}
      <div className="language-tabs">
        <button
          className={`tab-btn ${activeTab === "vi" ? "active" : ""}`}
          onClick={() => setActiveTab("vi")}
          type="button"
        >
          <i className="fas fa-flag"></i>
          Tiếng Việt
        </button>
        <button
          className={`tab-btn ${activeTab === "en" ? "active" : ""}`}
          onClick={() => setActiveTab("en")}
          type="button"
        >
          <i className="fas fa-flag"></i>
          English
        </button>
      </div>

      {/* Content Info */}
      <div className="content-info">
        <div className="info-item">
          <strong>Trang:</strong> {content.titleVi}
        </div>
        <div className="info-item">
          <strong>Key:</strong> <code>{content.translationKey}</code>
        </div>
        <div className="info-item">
          <a
            href={content.route}
            target="_blank"
            rel="noopener noreferrer"
            className="view-page-link"
          >
            <i className="fas fa-external-link-alt"></i>
            Xem trang
          </a>
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-container">
        {activeTab === "vi" && (
          <div className="editor-wrapper">
            <label className="editor-label">
              <i className="fas fa-edit"></i>
              Nội dung Tiếng Việt
            </label>
            <Editor
              key={`static-content-vi-${content.id}`}
              value={contentVi}
              onEditorChange={(newContent) => setContentVi(newContent)}
              init={{
                ...tinymceConfig,
                height: 600,
              }}
            />
          </div>
        )}

        {activeTab === "en" && (
          <div className="editor-wrapper">
            <label className="editor-label">
              <i className="fas fa-edit"></i>
              English Content
            </label>
            <Editor
              key={`static-content-en-${content.id}`}
              value={contentEn}
              onEditorChange={(newContent) => setContentEn(newContent)}
              init={{
                ...tinymceConfig,
                height: 600,
              }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          <i className="fas fa-times"></i>
          Hủy
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-success"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Đang lưu...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StaticContentForm;
