import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Editor } from "@tinymce/tinymce-react";
import { generateSlug } from "../../utils/slugUtils";
import { translateViToEn } from "../../services/translationService";
import api from "../../api";
import {
  handleFeaturedImageUpload,
  processEntityAttachments,
  cleanupBlobUrls,
} from "../../services/attachmentService";
import { tinymceConfig } from "../../config/tinymceConfig";
import { createNews, updateNews } from "../../services/newsService";
import { getApiUrl } from "../../config/apiConfig";
import { processWysiwygContent } from "../../utils/contentUtils";
import ToastMessage from "./ToastMessage";
import "./NewsCreationForm.css";

// Import TinyMCE locally (không dùng CDN) - giống NotificationsList
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";

const NewsCreationForm = ({
  categories = [],
  editingNews = null,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!editingNews;

  // Form data
  const [formData, setFormData] = useState({
    titleVi: editingNews?.titleVi || "",
    titleEn: editingNews?.titleEn || "",
    descriptionVi: editingNews?.descriptionVi || "",
    descriptionEn: editingNews?.descriptionEn || "",
    contentVi: editingNews?.contentVi ? processWysiwygContent(editingNews.contentVi) : "",
    contentEn: editingNews?.contentEn ? processWysiwygContent(editingNews.contentEn) : "",
    slugVi: editingNews?.slugVi || "",
    slugEn: editingNews?.slugEn || "",
    newsCategoryId: editingNews?.newsCategoryId || "",
    isOutstanding: editingNews?.isOutstanding || false,
    status: editingNews?.status ?? 1,
    timePosted: editingNews?.timePosted
      ? editingNews.timePosted.split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  // Upload state (luồng mới)
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [featuredImageId, setFeaturedImageId] = useState(null);

  // Gallery images state
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // File attachments state
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [translating, setTranslating] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Handle TinyMCE fullscreen để ẩn editor còn lại
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenEditors = document.querySelectorAll(".tox-fullscreen");
      const formRows = document.querySelectorAll(".form-row");

      formRows.forEach((row) => {
        const editorGroups = row.querySelectorAll(".form-group");
        if (editorGroups.length === 2) {
          // Row có 2 editors
          const hasFullscreen = row.querySelector(".tox-fullscreen");

          if (hasFullscreen) {
            // Có editor fullscreen trong row này
            editorGroups.forEach((group) => {
              const isFullscreenGroup = group.querySelector(".tox-fullscreen");
              if (!isFullscreenGroup) {
                group.style.display = "none";
              }
            });
          } else {
            // Không có editor fullscreen, hiện lại tất cả
            editorGroups.forEach((group) => {
              group.style.display = "";
            });
          }
        }
      });
    };

    // Listen for fullscreen changes
    const observer = new MutationObserver(handleFullscreenChange);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Load initial data
  useEffect(() => {
    if (isEditMode && editingNews) {
      loadExistingAttachments();
    }
  }, [isEditMode, editingNews]);

  const loadExistingAttachments = async () => {
    try {
      if (editingNews) {
        // Load featured image from imageUrl (API response uses lowercase)
        const imageUrl = editingNews.imageUrl || editingNews.ImageUrl;
        if (imageUrl) {
          const fullImageUrl = imageUrl.startsWith("http")
            ? imageUrl
            : getApiUrl(imageUrl);
          setFeaturedImagePreview(fullImageUrl);
        }

        // Set featured image ID from BE response
        if (editingNews.featuredImageId != null) {
          setFeaturedImageId(editingNews.featuredImageId);
        }

        // Load attachments from DetailNewsDto.attachments (lowercase)
        if (editingNews.attachments) {
          // Gallery images từ attachments.images
          if (
            editingNews.attachments.images &&
            editingNews.attachments.images.length > 0
          ) {
            // Transform API data to match component's expected format
            const transformedImages = editingNews.attachments.images.map(
              (img, index) => ({
                id: img.id,
                name: img.originalFileName,
                size: img.fileSize,
                type: img.contentType,
                uploading: false,
                preview: getApiUrl(img.url),
                attachmentId: img.id,
                url: img.url,
              })
            );
            setGalleryImages(transformedImages);
          }

          // File attachments từ attachments.documents
          if (
            editingNews.attachments.documents &&
            editingNews.attachments.documents.length > 0
          ) {
            // Transform API data to match component's expected format
            const transformedDocs = editingNews.attachments.documents.map(
              (doc, index) => ({
                id: doc.id,
                name: doc.originalFileName,
                size: doc.fileSize,
                type: doc.contentType,
                uploading: false,
                attachmentId: doc.id,
                url: doc.url,
              })
            );
            setAttachments(transformedDocs);
          }
        }}
    } catch (error) {}
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));

    // Auto-generate slugs
    if (field === "titleVi" && value) {
      setFormData((prev) => ({ ...prev, slugVi: generateSlug(value) }));
    } else if (field === "titleEn" && value) {
      setFormData((prev) => ({ ...prev, slugEn: generateSlug(value) }));
    }
  };

  // Translation
  const handleTranslate = async (fromField, toField) => {
    const text = formData[fromField] || "";
    if (!text) return;

    setTranslating((prev) => ({ ...prev, [toField]: true }));
    try {
      const translated = await translateViToEn(text);
      handleInputChange(toField, translated);
    } catch (err) {setToast({ show: true, message: "Dịch thất bại", type: "error" });
    } finally {
      setTranslating((prev) => ({ ...prev, [toField]: false }));
    }
  };

  // Featured image upload (luồng mới)
  const handleFeaturedImageChange = (file) => {
    if (file) {
      handleFeaturedImageUpload(
        file,
        setFeaturedImagePreview,
        setFeaturedImageId
      );
    } else {
      setFeaturedImagePreview(null);
      setFeaturedImageId(null);
    }
  };

  // Gallery images handlers
  const handleGalleryImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);

      // Tạo placeholder cho tất cả ảnh trước
      const imageInfos = fileArray.map((file, index) => ({
        id: Date.now() + Math.random() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        uploading: true,
        preview: URL.createObjectURL(file), // Preview tạm từ blob
        attachmentId: null,
        file: file,
      }));

      // Thêm tất cả vào gallery ngay
      setGalleryImages((prev) => [...prev, ...imageInfos]);

      // Upload song song tất cả ảnh
      const uploadPromises = imageInfos.map(async (imageInfo) => {
        try {
          const formData = new FormData();
          formData.append("file", imageInfo.file);

          const response = await api.post("/api/attachments", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data?.status === 1 && response.data?.data?.id) {
            const attachmentData = response.data.data;
            const baseUrl = api.defaults.baseURL;
            const serverUrl = attachmentData.url?.startsWith("http")
              ? attachmentData.url
              : `${baseUrl}${
                  attachmentData.url || `/api/attachments/${attachmentData.id}`
                }`;

            // Update ảnh này với data thật
            setGalleryImages((prev) =>
              prev.map((img) =>
                img.id === imageInfo.id
                  ? {
                      ...img,
                      uploading: false,
                      attachmentId: attachmentData.id,
                      preview: serverUrl,
                    }
                  : img
              )
            );

            // Cleanup blob URL
            URL.revokeObjectURL(imageInfo.preview);return {
              success: true,
              imageInfo,
              attachmentId: attachmentData.id,
            };
          } else {
            throw new Error("Upload failed - invalid response");
          }
        } catch (uploadError) {// Remove failed image from gallery
          setGalleryImages((prev) =>
            prev.filter((img) => img.id !== imageInfo.id)
          );
          URL.revokeObjectURL(imageInfo.preview);

          return { success: false, imageInfo, error: uploadError };
        }
      });

      // Đợi tất cả upload xong
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        setToast({
          show: true,
          message: `Upload thành công ${successCount}/${fileArray.length} ảnh`,
          type: "success",
        });
      }

      if (failCount > 0) {
        setToast({
          show: true,
          message: `${failCount} ảnh upload thất bại`,
          type: "error",
        });
      }
    } catch (error) {setToast({
        show: true,
        message: "Lỗi khi thêm ảnh vào gallery",
        type: "error",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeGalleryImage = (imageId) => {
    setGalleryImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  // File attachments handlers
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        // Create file info first
        const fileInfo = {
          id: Date.now() + Math.random() + fileArray.indexOf(file),
          name: file.name,
          size: file.size,
          type: file.type,
          uploading: true,
          attachmentId: null,
        };

        // Add to list first
        setAttachments((prev) => [...prev, fileInfo]);

        // Upload file to server
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await api.post("/api/attachments", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data?.status === 1 && response.data?.data?.id) {
            // Update with real attachment ID from server
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === fileInfo.id
                  ? {
                      ...att,
                      uploading: false,
                      attachmentId: response.data.data.id,
                      url: response.data.data.url,
                    }
                  : att
              )
            );
          } else {
            throw new Error("Upload failed");
          }
        } catch (uploadError) {setAttachments((prev) =>
            prev.filter((att) => att.id !== fileInfo.id)
          );
          setToast({
            show: true,
            message: `Lỗi upload file ${file.name}`,
            type: "error",
          });
        }
      }

      setToast({
        show: true,
        message: `Đang tải lên ${fileArray.length} file...`,
        type: "info",
      });
    } catch (error) {setToast({
        show: true,
        message: "Lỗi khi thêm file đính kèm",
        type: "error",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titleVi?.trim()) {
      newErrors.titleVi = "Tiêu đề tiếng Việt là bắt buộc";
    }
    if (!formData.newsCategoryId) {
      newErrors.newsCategoryId = "Danh mục là bắt buộc";
    }
    if (!formData.descriptionVi?.trim()) {
      newErrors.descriptionVi = "Mô tả tiếng Việt là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save (luồng mới)
  const handleSave = async () => {
    if (!validateForm()) {
      setToast({
        show: true,
        message: "Vui lòng kiểm tra lại thông tin",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare data - ID not needed in body (only in URL)
      const newsData = {
        titleVi: formData.titleVi.trim(),
        titleEn: formData.titleEn?.trim() || "",
        descriptionVi: formData.descriptionVi.trim(),
        descriptionEn: formData.descriptionEn?.trim() || "",
        contentVi: formData.contentVi,
        contentEn: formData.contentEn || "",
        slugVi: formData.slugVi || generateSlug(formData.titleVi),
        slugEn:
          formData.slugEn || generateSlug(formData.titleEn || formData.titleVi),
        newsCategoryId: parseInt(formData.newsCategoryId),
        status: formData.status,
        isOutstanding: formData.isOutstanding,
        timePosted: new Date(formData.timePosted).toISOString(),
        featuredImageId: featuredImageId,
        // LUÔN gửi attachmentIds để BE biết chính xác user muốn gì
        // [] = xóa hết, [1,2,3] = giữ những file này
        attachmentIds: [
          ...galleryImages.map((img) => img.attachmentId).filter(Boolean),
          ...attachments
            .map((att) => att.attachmentId || att.id)
            .filter(Boolean),
        ],
      };
      // Data prepared for backend

      // 1. Create or Update news using newsService methods
      const response = isEditMode
        ? await updateNews(editingNews.id, newsData)
        : await createNews(newsData);

      if (response?.status === 1 && response?.data?.id) {
        const newsId = response.data.id;

        // 2. Process attachments - chỉ xử lý content attachments,
        // không cần associate attachmentIds vì BE đã handle rồi
        const contentOnlyData = {
          contentVi: newsData.contentVi,
          contentEn: newsData.contentEn,
          // Không gửi attachmentIds để tránh double processing
        };
        await processEntityAttachments(contentOnlyData, "News", newsId);

        // 3. Cleanup
        cleanupBlobUrls();

        setToast({
          show: true,
          message: `${isEditMode ? "Cập nhật" : "Lưu"} tin tức thành công!`,
          type: "success",
        });

        setTimeout(() => {
          if (onSuccess) onSuccess(response.data);
        }, 1000);
      } else {
        // Handle BE error response với proper message
        const errorMessage = response?.message || "Lưu thất bại";
        throw new Error(errorMessage);
      }
    } catch (error) {setToast({
        show: true,
        message:
          error.message || error.response?.data?.message || "Lưu thất bại",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-creation-form">
      <div className="form-header">
        <h2>{isEditMode ? "Chỉnh sửa tin tức" : "Tạo tin tức mới"}</h2>
      </div>

      <div className="form-content">
        {/* Content Fields - Side by side Vi/En */}
        <div className="form-section">
          <h4>Nội dung bài viết</h4>

          {/* Title Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Tiêu đề (Tiếng Việt) *</label>
              <input
                type="text"
                value={formData.titleVi}
                onChange={(e) => handleInputChange("titleVi", e.target.value)}
                className={errors.titleVi ? "error" : ""}
                placeholder="Nhập tiêu đề tiếng Việt..."
              />
              {errors.titleVi && (
                <span className="error-text">{errors.titleVi}</span>
              )}
            </div>

            <div className="form-group">
              <label>Title (English)</label>
              <div className="input-with-translate">
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => handleInputChange("titleEn", e.target.value)}
                  placeholder="English title will be auto-generated..."
                />
                <button
                  type="button"
                  onClick={() => handleTranslate("titleVi", "titleEn")}
                  disabled={translating.titleEn || !formData.titleVi}
                  className="translate-btn"
                >
                  {translating.titleEn ? "..." : "Dịch"}
                </button>
              </div>
            </div>
          </div>

          {/* Description Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Mô tả (Tiếng Việt) *</label>
              <textarea
                value={formData.descriptionVi}
                onChange={(e) =>
                  handleInputChange("descriptionVi", e.target.value)
                }
                rows="3"
                className={errors.descriptionVi ? "error" : ""}
                placeholder="Nhập mô tả tiếng Việt..."
              />
              {errors.descriptionVi && (
                <span className="error-text">{errors.descriptionVi}</span>
              )}
            </div>

            <div className="form-group">
              <label>Description (English)</label>
              <div className="input-with-translate">
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    handleInputChange("descriptionEn", e.target.value)
                  }
                  rows="3"
                  placeholder="English description will be auto-generated..."
                />
                <button
                  type="button"
                  onClick={() =>
                    handleTranslate("descriptionVi", "descriptionEn")
                  }
                  disabled={
                    translating.descriptionEn || !formData.descriptionVi
                  }
                  className="translate-btn"
                >
                  {translating.descriptionEn ? "..." : "Dịch"}
                </button>
              </div>
            </div>
          </div>

          {/* Content Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Nội dung (Tiếng Việt)</label>
              <Editor
                key={`content-vi-${editingNews?.id || "new"}`}
                value={formData.contentVi}
                onEditorChange={(content) =>
                  handleInputChange("contentVi", content)
                }
                init={tinymceConfig}
              />
            </div>

            <div className="form-group">
              <label>Content (English)</label>
              <div style={{ position: "relative" }}>
                <Editor
                  key={`content-en-${editingNews?.id || "new"}`}
                  value={formData.contentEn}
                  onEditorChange={(content) =>
                    handleInputChange("contentEn", content)
                  }
                  init={tinymceConfig}
                />
                <button
                  type="button"
                  onClick={() => handleTranslate("contentVi", "contentEn")}
                  disabled={translating.contentEn || !formData.contentVi}
                  className="translate-btn"
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    zIndex: 1000,
                    fontSize: "11px",
                    padding: "4px 8px",
                  }}
                >
                  {translating.ContentEn ? "..." : "Dịch"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Common fields - 2 columns layout */}
        <div className="form-section">
          <h4>Cài đặt chung</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Danh mục *</label>
              <select
                value={formData.newsCategoryId}
                onChange={(e) =>
                  handleInputChange("newsCategoryId", e.target.value)
                }
                className={errors.newsCategoryId ? "error" : ""}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.titleVi}
                  </option>
                ))}
              </select>
              {errors.newsCategoryId && (
                <span className="error-text">{errors.newsCategoryId}</span>
              )}
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleInputChange("status", parseInt(e.target.value))
                }
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thời gian đăng</label>
              <input
                type="date"
                value={formData.timePosted}
                onChange={(e) =>
                  handleInputChange("timePosted", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "28px",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isOutstanding}
                  onChange={(e) =>
                    handleInputChange("isOutstanding", e.target.checked)
                  }
                />
                Tin nổi bật
              </label>
            </div>
          </div>
        </div>

        {/* Slugs section */}
        <div className="form-section">
          <h4>URL thân thiện (SEO)</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Slug tiếng Việt</label>
              <input
                type="text"
                value={formData.slugVi}
                onChange={(e) => handleInputChange("slugVi", e.target.value)}
                placeholder="tu-dong-tao-tu-tieu-de"
              />
            </div>

            <div className="form-group">
              <label>Slug tiếng Anh</label>
              <input
                type="text"
                value={formData.slugEn}
                onChange={(e) => handleInputChange("slugEn", e.target.value)}
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>
        </div>

        {/* Featured image section */}
        <div className="form-section">
          <h4>Ảnh đại diện</h4>

          <div className="form-group">
            <div className="file-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFeaturedImageChange(e.target.files[0])}
                style={{ marginBottom: "10px" }}
              />
              {featuredImagePreview && (
                <div className="image-preview" style={{ marginTop: "15px" }}>
                  <img
                    src={featuredImagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery images section */}
        <div className="form-section">
          <h4>Thư viện ảnh</h4>

          <div className="form-group">
            <label>Tải lên ảnh cho tin tức</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleGalleryImageUpload(e.target.files)}
                disabled={uploadingImages}
                style={{ marginBottom: "10px" }}
              />
              <div style={{ fontSize: "12px", color: "#6c757d" }}>
                Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB mỗi ảnh)
              </div>
            </div>

            {/* Gallery preview */}
            {galleryImages.length > 0 && (
              <div className="gallery-preview" style={{ marginTop: "15px" }}>
                <h5>Ảnh đã tải lên ({galleryImages.length} ảnh):</h5>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: "10px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  {galleryImages.map((image) => (
                    <div
                      key={image.id}
                      className="gallery-item"
                      style={{
                        position: "relative",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        overflow: "hidden",
                        backgroundColor: image.uploading
                          ? "#f8f9fa"
                          : "transparent",
                      }}
                    >
                      {image.uploading ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <div
                            style={{ textAlign: "center", color: "#6c757d" }}
                          >
                            <div>Đang tải...</div>
                            <div style={{ fontSize: "10px" }}>{image.name}</div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={image.preview}
                          alt={image.name}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(image.id)}
                        disabled={image.uploading}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          fontSize: "12px",
                          cursor: image.uploading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: image.uploading ? 0.6 : 1,
                        }}
                      >
                        ×
                      </button>
                      {!image.uploading && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            right: "0",
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            fontSize: "10px",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {image.name.length > 15
                            ? image.name.substring(0, 12) + "..."
                            : image.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File attachments section */}
        <div className="form-section">
          <h4>File đính kèm</h4>

          <div className="form-group">
            <label>Tải lên file đính kèm</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={uploadingFiles}
                style={{ marginBottom: "10px" }}
              />
              <div style={{ fontSize: "12px", color: "#6c757d" }}>
                Hỗ trợ: PDF, DOC, XLS, PPT, TXT, ZIP, RAR (tối đa 10MB mỗi file)
              </div>
            </div>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="attachments-list" style={{ marginTop: "15px" }}>
                <h5>File đã đính kèm:</h5>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="attachment-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        marginBottom: "5px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "500" }}>
                          {attachment.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d" }}>
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Hủy
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? `Đang ${isEditMode ? "cập nhật" : "lưu"}...`
            : `${isEditMode ? "Cập nhật" : "Lưu"} tin tức`}
        </button>
      </div>

      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default NewsCreationForm;
