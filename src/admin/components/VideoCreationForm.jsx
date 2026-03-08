import React, { useState, useEffect } from "react";
import videoService from "../../services/videoService";
import ToastMessage from "./ToastMessage";
import "./NewsCreationForm.css"; // Reuse existing styles

const VideoCreationForm = ({
  editingVideo = null,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!editingVideo;

  // Form data
  const [formData, setFormData] = useState({
    titleVi: "",
    titleEn: "",
    descriptionVi: "",
    descriptionEn: "",
    youtubeId: "",
    thumbnail: "",
    status: 1,
    order: 0
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [youtubePreview, setYoutubePreview] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Sync formData when editingVideo changes
  useEffect(() => {
    if (editingVideo) {
      setFormData({
        titleVi: editingVideo.titleVi || "",
        titleEn: editingVideo.titleEn || "",
        descriptionVi: editingVideo.descriptionVi || "",
        descriptionEn: editingVideo.descriptionEn || "",
        youtubeId: editingVideo.youtubeId || "",
        thumbnail: editingVideo.thumbnail || "",
        status: editingVideo.status ?? 1,
        order: editingVideo.order ?? 0
      });

      // Set preview if youtubeId exists
      if (editingVideo.youtubeId) {
        setYoutubePreview(videoService.getYoutubeThumbnail(editingVideo.youtubeId));
      }
    }
  }, [editingVideo]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update YouTube preview when youtubeId changes
    if (field === 'youtubeId') {
      const extractedId = videoService.extractYoutubeId(value);
      if (extractedId && extractedId.length === 11) {
        setYoutubePreview(videoService.getYoutubeThumbnail(extractedId));
        // Auto-update the youtubeId field with extracted ID
        if (extractedId !== value) {
          setFormData(prev => ({ ...prev, youtubeId: extractedId }));
        }
      } else {
        setYoutubePreview(null);
      }
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titleVi?.trim()) {
      newErrors.titleVi = "Tiêu đề tiếng Việt là bắt buộc";
    }

    if (!formData.youtubeId?.trim()) {
      newErrors.youtubeId = "YouTube ID là bắt buộc";
    } else if (formData.youtubeId.length !== 11) {
      newErrors.youtubeId = "YouTube ID phải có đúng 11 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Vui lòng kiểm tra lại thông tin", "error");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isEditMode) {
        response = await videoService.updateVideo(editingVideo.id, formData);
      } else {
        response = await videoService.createVideo(formData);
      }

      if (response.success) {
        showToast(response.message, "success");
        setTimeout(() => {
          onSuccess && onSuccess(response.data);
        }, 500);
      } else {
        showToast(response.message || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-creation-form">
      <form onSubmit={handleSubmit}>
        {/* YouTube ID Section */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="fab fa-youtube"></i> Video YouTube
          </h4>

          <div className="form-group">
            <label>
              YouTube ID / URL <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.youtubeId ? "is-invalid" : ""}`}
              value={formData.youtubeId}
              onChange={(e) => handleInputChange("youtubeId", e.target.value)}
              placeholder="Nhập YouTube ID (VD: dQw4w9WgXcQ) hoặc URL đầy đủ"
            />
            {errors.youtubeId && (
              <div className="invalid-feedback">{errors.youtubeId}</div>
            )}
            <small className="form-text text-muted">
              Có thể nhập ID (11 ký tự) hoặc URL đầy đủ (https://youtube.com/watch?v=...)
            </small>
          </div>

          {/* YouTube Preview */}
          {youtubePreview && (
            <div className="youtube-preview" style={{ marginTop: "1rem" }}>
              <label>Xem trước:</label>
              <div style={{
                position: "relative",
                maxWidth: "400px",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <img
                  src={youtubePreview}
                  alt="YouTube Thumbnail"
                  style={{
                    width: "100%",
                    display: "block"
                  }}
                  onError={(e) => {
                    // Fallback to hqdefault if maxresdefault not available
                    e.target.src = videoService.getYoutubeThumbnail(formData.youtubeId, 'hqdefault');
                  }}
                />
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "60px",
                  height: "60px",
                  background: "rgba(255,0,0,0.9)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="fa fa-play" style={{ color: "#fff", fontSize: "24px", marginLeft: "4px" }}></i>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title Section */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="fas fa-heading"></i> Tiêu đề
          </h4>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>
                  Tiêu đề (Tiếng Việt) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.titleVi ? "is-invalid" : ""}`}
                  value={formData.titleVi}
                  onChange={(e) => handleInputChange("titleVi", e.target.value)}
                  placeholder="Nhập tiêu đề tiếng Việt"
                />
                {errors.titleVi && (
                  <div className="invalid-feedback">{errors.titleVi}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Tiêu đề (Tiếng Anh)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.titleEn}
                  onChange={(e) => handleInputChange("titleEn", e.target.value)}
                  placeholder="Nhập tiêu đề tiếng Anh"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="fas fa-align-left"></i> Mô tả
          </h4>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Mô tả (Tiếng Việt)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.descriptionVi}
                  onChange={(e) => handleInputChange("descriptionVi", e.target.value)}
                  placeholder="Nhập mô tả tiếng Việt"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Mô tả (Tiếng Anh)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange("descriptionEn", e.target.value)}
                  placeholder="Nhập mô tả tiếng Anh"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="form-section">
          <h4 className="section-title">
            <i className="fas fa-cog"></i> Cài đặt
          </h4>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", parseInt(e.target.value))}
                >
                  <option value={1}>Hiển thị</option>
                  <option value={0}>Ẩn</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                />
                <small className="form-text text-muted">
                  Số nhỏ hiển thị trước
                </small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Thumbnail URL (tùy chọn)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange("thumbnail", e.target.value)}
                  placeholder="Để trống sẽ lấy từ YouTube"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions" style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e9ecef",
          display: "flex",
          gap: "0.5rem",
          justifyContent: "flex-end"
        }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <i className="fas fa-times"></i> Hủy
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> {isEditMode ? "Cập nhật" : "Tạo mới"}
              </>
            )}
          </button>
        </div>
      </form>

      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

export default VideoCreationForm;
