import React, { useState, useEffect, useCallback } from "react";
import internalDocumentsAdminService from "../../services/internalDocumentsAdminService";
import api from "../../api";

const InternalDocumentCreationForm = ({
  onSuccess,
  onCancel,
  editMode = false,
  editData = null,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    attachmentIds: [],
    status: 1,
    timePosted: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);

  // Load categories
  const categories = internalDocumentsAdminService.getInternalDocumentCategories();

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && editData) {
      // Format timePosted for date input (YYYY-MM-DD only)
      let formattedTime = "";
      if (editData.timePosted) {
        const date = new Date(editData.timePosted);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedTime = `${year}-${month}-${day}`;
      }

      setFormData({
        title: editData.title || "",
        description: editData.description || "",
        category: editData.category || "",
        attachmentIds: editData.attachmentIds || [],
        status: editData.status !== undefined ? editData.status : 1,
        timePosted: formattedTime,
      });

      // Load existing attachment if any
      if (editData.attachment) {
        const existingAttachment = {
          id: editData.attachment.id,
          fileName: editData.attachment.originalFileName,
          fileSize: editData.attachment.fileSize,
          url: editData.attachment.url,
          uploading: false
        };
        setAttachments([existingAttachment]);
      }
    }
  }, [editMode, editData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAttachmentsChange = useCallback((newAttachments) => {setAttachments(newAttachments);
    
    // Extract attachment IDs
    const attachmentIds = newAttachments
      .filter(att => att.id)
      .map(att => att.id);
    
    setFormData(prev => ({
      ...prev,
      attachmentIds: attachmentIds
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }

    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }

    if (attachments.length === 0) {
      newErrors.attachments = "Vui lòng tải lên ít nhất một file đính kèm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {return;
    }

    setIsSubmitting(true);

    try {let attachmentId = null;

      // Step 1: Upload file first if there's a new file
      if (attachments.length > 0 && attachments[0].file) {const file = attachments[0].file; // Take first file only
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
          const response = await api.post("/api/attachments", uploadFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });if (response.data?.status === 1 && response.data?.data?.id) {
            attachmentId = response.data.data.id;} else {
            throw new Error('Invalid upload response');
          }
        } catch (uploadError) {setErrors({ general: "Lỗi upload file. Vui lòng thử lại." });
          return;
        }
      } else if (editMode && attachments.length > 0 && !attachments[0].file && attachments[0].id) {
        // Keep existing attachment if no new file uploaded
        attachmentId = attachments[0].id;}

      // Step 2: Create/Update document with attachmentId
      const documentData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        attachmentId: attachmentId,
        status: formData.status,
        timePosted: formData.timePosted || null
      };let result;
      if (editMode && editData?.id) {
        result = await internalDocumentsAdminService.updateInternalDocument(editData.id, documentData);
      } else {
        result = await internalDocumentsAdminService.createInternalDocument(documentData);
      }if (result.success) {onSuccess?.(result.data, editMode ? 'update' : 'create');
      } else {setErrors({ general: result.message });
      }
    } catch (error) {setErrors({ 
        general: error.message || `Lỗi ${editMode ? 'cập nhật' : 'tạo'} tài liệu nội bộ` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="internal-document-creation-form">
      <div className="needs-validation">
        {/* General Error */}
        {errors.general && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errors.general}
          </div>
        )}

        {/* Title */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Tiêu đề <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Nhập tiêu đề tài liệu nội bộ"
            disabled={isSubmitting}
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}
        </div>

        {/* Category */}
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Danh mục <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.category ? "is-invalid" : ""}`}
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={isSubmitting}
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <div className="invalid-feedback">{errors.category}</div>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Mô tả
          </label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả chi tiết về tài liệu"
            disabled={isSubmitting}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>

        {/* File Attachments */}
        <div className="mb-3">
          <label className="form-label">
            File đính kèm <span className="text-danger">*</span>
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                const processedFiles = files.map((file, index) => ({
                  id: Date.now() + Math.random() + index,
                  fileName: file.name,
                  fileSize: file.size,
                  file: file,
                  uploading: false
                }));
                const updatedAttachments = [...attachments, ...processedFiles];
                setAttachments(updatedAttachments);
                handleAttachmentsChange(updatedAttachments);
              }
            }}
            className={`form-control ${errors.attachments ? 'is-invalid' : ''}`}
            disabled={isSubmitting}
          />
          <small className="form-text text-muted">
            Chọn nhiều file tài liệu. Hỗ trợ PDF, Word, Excel, Text. Tối đa 5 files.
          </small>
          {errors.attachments && (
            <div className="invalid-feedback">{errors.attachments}</div>
          )}
        </div>

        {/* Files Preview */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <h6>File đã chọn: ({attachments.length}/5)</h6>
            <div className="files-grid">
              {attachments.map((file) => (
                <div key={file.id} className="file-item d-flex align-items-center p-2 border rounded mb-2">
                  <div className="file-info flex-grow-1">
                    <i className="fas fa-file-alt me-2"></i>
                    <span className="file-name">
                      {file.fileName.length > 30 ? file.fileName.substring(0, 30) + '...' : file.fileName}
                    </span>
                    <small className="text-muted ms-2">
                      ({Math.round(file.fileSize / 1024)} KB)
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      const updatedAttachments = attachments.filter(att => att.id !== file.id);
                      setAttachments(updatedAttachments);
                      handleAttachmentsChange(updatedAttachments);
                    }}
                    title="Xóa file"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Posted */}
        <div className="mb-3">
          <label htmlFor="timePosted" className="form-label">
            Ngày đăng
          </label>
          <input
            type="date"
            className="form-control"
            id="timePosted"
            name="timePosted"
            value={formData.timePosted}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <small className="form-text text-muted">
            Để trống để sử dụng ngày hiện tại
          </small>
        </div>

        {/* Status */}
        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            Trạng thái
          </label>
          <select
            className="form-select"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={isSubmitting}
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Không hoạt động</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <i className="bi bi-x-circle me-1"></i>
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                {editMode ? "Đang cập nhật..." : "Đang tạo..."}
              </>
            ) : (
              <>
                <i className={`bi ${editMode ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                {editMode ? "Cập nhật" : "Tạo mới"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalDocumentCreationForm;