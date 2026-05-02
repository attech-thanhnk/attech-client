import React, { useState, useEffect, useCallback } from "react";
import isoDocumentService from "../../services/isoDocumentService";
import api from "../../api";

const IsoDocumentCreationForm = ({
  onSuccess,
  onCancel,
  editMode = false,
  editData = null,
}) => {
  const [formData, setFormData] = useState({
    titleVi: "",
    titleEn: "",
    descriptionVi: "",
    descriptionEn: "",
    certificateYear: "",
    expiryDate: "",
    attachmentIds: [],
    status: 1,
    displayOrder: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && editData) {
      // Format expiryDate for date input (YYYY-MM-DD only)
      let formattedExpiryDate = "";
      if (editData.expiryDate) {
        const date = new Date(editData.expiryDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        formattedExpiryDate = `${year}-${month}-${day}`;
      }

      setFormData({
        titleVi: editData.titleVi || "",
        titleEn: editData.titleEn || "",
        descriptionVi: editData.descriptionVi || "",
        descriptionEn: editData.descriptionEn || "",
        certificateYear: editData.certificateYear || "",
        expiryDate: formattedExpiryDate,
        attachmentIds: editData.attachmentIds || [],
        status: editData.status !== undefined ? editData.status : 1,
        displayOrder: editData.displayOrder || 0,
      });

      // Load existing attachments if any
      if (editData.attachments && editData.attachments.length > 0) {
        const existingAttachments = editData.attachments.map((att) => ({
          id: att.id,
          fileName: att.originalFileName,
          fileSize: att.fileSize,
          url: att.url,
          uploading: false,
        }));
        setAttachments(existingAttachments);
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

  const handleAttachmentsChange = useCallback((newAttachments) => {
    setAttachments(newAttachments);

    // Extract attachment IDs
    const attachmentIds = newAttachments
      .filter((att) => att.id)
      .map((att) => att.id);

    setFormData((prev) => ({
      ...prev,
      attachmentIds: attachmentIds,
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titleVi.trim()) {
      newErrors.titleVi = "Tiêu đề tiếng Việt không được để trống";
    }

    if (!formData.titleEn.trim()) {
      newErrors.titleEn = "Tiêu đề tiếng Anh không được để trống";
    }

    if (!formData.certificateYear) {
      newErrors.certificateYear = "Năm cấp chứng chỉ không được để trống";
    }

    const year = parseInt(formData.certificateYear);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 10) {
      newErrors.certificateYear = `Năm cấp phải từ 1900 đến ${
        currentYear + 10
      }`;
    }

    if (attachments.length === 0) {
      newErrors.attachments =
        "Vui lòng tải lên ít nhất một file chứng chỉ ISO";
    }

    if (attachments.length > 3) {
      newErrors.attachments = "Tối đa 3 files được phép";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const attachmentIds = [];

      // Step 1: Upload all new files
      const newFiles = attachments.filter((att) => att.file);
      if (newFiles.length > 0) {
        for (const attachment of newFiles) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", attachment.file);

          try {
            const response = await api.post("/api/attachments", uploadFormData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
            if (response.data?.status === 1 && response.data?.data?.id) {
              attachmentIds.push(response.data.data.id);
            } else {
              throw new Error("Invalid upload response");
            }
          } catch (uploadError) {
            setErrors({
              general: `Lỗi upload file "${attachment.fileName}". Vui lòng thử lại.`,
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Keep existing attachments (for edit mode)
      const existingAttachments = attachments.filter(
        (att) => !att.file && att.id
      );
      existingAttachments.forEach((att) => {
        attachmentIds.push(att.id);
      });

      // Step 2: Create/Update ISO document with attachmentIds
      const documentData = {
        titleVi: formData.titleVi,
        titleEn: formData.titleEn,
        descriptionVi: formData.descriptionVi,
        descriptionEn: formData.descriptionEn,
        certificateYear: formData.certificateYear,
        expiryDate: formData.expiryDate || null,
        attachmentIds: attachmentIds,
        status: formData.status,
        displayOrder: formData.displayOrder,
      };

      let result;
      if (editMode && editData?.id) {
        result = await isoDocumentService.updateIsoDocument(
          editData.id,
          documentData
        );
      } else {
        result = await isoDocumentService.createIsoDocument(documentData);
      }

      if (result.success) {
        onSuccess?.(result.data, editMode ? "update" : "create");
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({
        general:
          error.message ||
          `Lỗi ${editMode ? "cập nhật" : "tạo"} chứng chỉ ISO`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="iso-document-creation-form">
      <div className="needs-validation">
        {/* General Error */}
        {errors.general && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errors.general}
          </div>
        )}

        {/* Title Vietnamese */}
        <div className="mb-3">
          <label htmlFor="titleVi" className="form-label">
            Tiêu đề (Tiếng Việt) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.titleVi ? "is-invalid" : ""}`}
            id="titleVi"
            name="titleVi"
            value={formData.titleVi}
            onChange={handleInputChange}
            placeholder="Ví dụ: Hệ thống chứng chỉ ISO 9001:2015"
            disabled={isSubmitting}
          />
          {errors.titleVi && (
            <div className="invalid-feedback">{errors.titleVi}</div>
          )}
        </div>

        {/* Title English */}
        <div className="mb-3">
          <label htmlFor="titleEn" className="form-label">
            Tiêu đề (Tiếng Anh) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.titleEn ? "is-invalid" : ""}`}
            id="titleEn"
            name="titleEn"
            value={formData.titleEn}
            onChange={handleInputChange}
            placeholder="Example: ISO 9001:2015 Certificate System"
            disabled={isSubmitting}
          />
          {errors.titleEn && (
            <div className="invalid-feedback">{errors.titleEn}</div>
          )}
        </div>

        {/* Description Vietnamese */}
        <div className="mb-3">
          <label htmlFor="descriptionVi" className="form-label">
            Mô tả (Tiếng Việt)
          </label>
          <textarea
            className="form-control"
            id="descriptionVi"
            name="descriptionVi"
            rows="3"
            value={formData.descriptionVi}
            onChange={handleInputChange}
            placeholder="Nhập mô tả chi tiết về chứng chỉ ISO"
            disabled={isSubmitting}
          />
        </div>

        {/* Description English */}
        <div className="mb-3">
          <label htmlFor="descriptionEn" className="form-label">
            Mô tả (Tiếng Anh)
          </label>
          <textarea
            className="form-control"
            id="descriptionEn"
            name="descriptionEn"
            rows="3"
            value={formData.descriptionEn}
            onChange={handleInputChange}
            placeholder="Enter detailed description about ISO certificate"
            disabled={isSubmitting}
          />
        </div>

        {/* Certificate Year */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="certificateYear" className="form-label">
              Năm cấp chứng chỉ <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className={`form-control ${
                errors.certificateYear ? "is-invalid" : ""
              }`}
              id="certificateYear"
              name="certificateYear"
              value={formData.certificateYear}
              onChange={handleInputChange}
              placeholder="2015"
              min="1900"
              max={new Date().getFullYear() + 10}
              disabled={isSubmitting}
            />
            {errors.certificateYear && (
              <div className="invalid-feedback">{errors.certificateYear}</div>
            )}
          </div>

          {/* Expiry Date */}
          <div className="col-md-6">
            <label htmlFor="expiryDate" className="form-label">
              Ngày hết hạn
            </label>
            <input
              type="date"
              className="form-control"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            <small className="form-text text-muted">
              Để trống nếu không có ngày hết hạn
            </small>
          </div>
        </div>

        {/* File Attachments */}
        <div className="mb-3">
          <label className="form-label">
            File chứng chỉ ISO <span className="text-danger">*</span>
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                // Check total files limit
                if (attachments.length + files.length > 3) {
                  alert(
                    `Chỉ được upload tối đa 3 files. Hiện tại có ${attachments.length} files, bạn chọn thêm ${files.length} files.`
                  );
                  e.target.value = ""; // Reset input
                  return;
                }

                const processedFiles = files.map((file, index) => ({
                  id: Date.now() + Math.random() + index,
                  fileName: file.name,
                  fileSize: file.size,
                  file: file,
                  uploading: false,
                }));
                const updatedAttachments = [...attachments, ...processedFiles];
                setAttachments(updatedAttachments);
                handleAttachmentsChange(updatedAttachments);
              }
              e.target.value = ""; // Reset input to allow re-selecting same file
            }}
            className={`form-control ${
              errors.attachments ? "is-invalid" : ""
            }`}
            disabled={isSubmitting || attachments.length >= 3}
          />
          <small className="form-text text-muted">
            Chọn file chứng chỉ. Hỗ trợ PDF, JPG, PNG. Tối đa 3 files.
          </small>
          {errors.attachments && (
            <div className="invalid-feedback d-block">{errors.attachments}</div>
          )}
        </div>

        {/* Files Preview */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <h6>File đã chọn: ({attachments.length}/3)</h6>
            <div className="files-grid">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="file-item d-flex align-items-center p-2 border rounded mb-2"
                >
                  <div className="file-info flex-grow-1">
                    <i className="fas fa-file-pdf me-2 text-danger"></i>
                    <span className="file-name">
                      {file.fileName.length > 40
                        ? file.fileName.substring(0, 40) + "..."
                        : file.fileName}
                    </span>
                    <small className="text-muted ms-2">
                      ({Math.round(file.fileSize / 1024)} KB)
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      const updatedAttachments = attachments.filter(
                        (att) => att.id !== file.id
                      );
                      setAttachments(updatedAttachments);
                      handleAttachmentsChange(updatedAttachments);
                    }}
                    title="Xóa file"
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display Order */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="displayOrder" className="form-label">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              className="form-control"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              disabled={isSubmitting}
            />
            <small className="form-text text-muted">
              Số thứ tự hiển thị (nhỏ hơn sẽ hiện trước)
            </small>
          </div>

          {/* Status */}
          <div className="col-md-6">
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
                <i
                  className={`bi ${
                    editMode ? "bi-check-circle" : "bi-plus-circle"
                  } me-1`}
                ></i>
                {editMode ? "Cập nhật" : "Tạo mới"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IsoDocumentCreationForm;
