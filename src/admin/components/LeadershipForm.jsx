import React, { useState, useEffect } from "react";
import staticContentService from "../../services/staticContentService";
import "./LeadershipForm.css";

const LeadershipForm = ({ content, onSuccess, onCancel }) => {
  const [leadershipData, setLeadershipData] = useState({
    chairman: { name: "" },
    director: { name: "" },
    viceDirectors: [
      { name: "" },
      { name: "" },
      { name: "" },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Load current content from translation
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoadingInitial(true);
        const data = await staticContentService.getContent(
          content.translationKey
        );

        // Parse JSON data if exists
        if (data.vi) {
          try {
            const parsedData = JSON.parse(data.vi);
            setLeadershipData(parsedData);
          } catch (e) {
          }
        }
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

  const handleInputChange = (category, index, field, value) => {
    setLeadershipData((prev) => {
      const newData = { ...prev };

      if (category === "viceDirectors") {
        newData.viceDirectors[index][field] = value;
      } else {
        newData[category][field] = value;
      }

      return newData;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Save as JSON string in both languages (same data for both)
      const jsonData = JSON.stringify(leadershipData, null, 2);

      await staticContentService.updateContent(content.translationKey, {
        vi: jsonData,
        en: jsonData,
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
      <div className="leadership-form">
        <div className="loading-state">
          <div className="spinner-border" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p>Đang tải thông tin ban lãnh đạo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leadership-form">
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

      {/* Content Info */}
      <div className="content-info">
        <div className="info-item">
          <strong>Trang:</strong> {content.titleVi}
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

      {/* Form Content */}
      <div className="leadership-form-content">
        {/* Chairman Section */}
        <div className="leader-section">
          <h3 className="section-title">
            <i className="fas fa-crown"></i>
            Chủ tịch công ty
          </h3>
          <div className="leader-fields">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={leadershipData.chairman.name}
                onChange={(e) =>
                  handleInputChange("chairman", null, "name", e.target.value)
                }
                placeholder="Nhập họ tên Chủ tịch công ty"
              />
            </div>
          </div>
        </div>

        {/* Director Section */}
        <div className="leader-section">
          <h3 className="section-title">
            <i className="fas fa-user-tie"></i>
            Giám đốc
          </h3>
          <div className="leader-fields">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={leadershipData.director.name}
                onChange={(e) =>
                  handleInputChange("director", null, "name", e.target.value)
                }
                placeholder="Nhập họ tên Giám đốc"
              />
            </div>
          </div>
        </div>

        {/* Vice Directors Section */}
        <div className="leader-section">
          <h3 className="section-title">
            <i className="fas fa-users"></i>
            Phó giám đốc
          </h3>
          {leadershipData.viceDirectors.map((viceDir, index) => (
            <div key={index} className="vice-director-item">
              <h4>Phó giám đốc {index + 1}</h4>
              <div className="leader-fields">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={viceDir.name}
                    onChange={(e) =>
                      handleInputChange(
                        "viceDirectors",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Nhập họ tên Phó giám đốc"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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

export default LeadershipForm;
