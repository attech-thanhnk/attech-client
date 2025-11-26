import React, { useState, useEffect } from "react";
import albumService from "../../services/albumService";
import api from "../../api";
import { handleFeaturedImageUpload } from "../../services/attachmentService";
import { getApiUrl } from "../../config/apiConfig";
import ImageWithAuth from "../../components/UI/ImageWithAuth";
import ToastMessage from "./ToastMessage";
import "./NewsCreationForm.css"; // Reuse existing styles

const AlbumCreationForm = ({
  editingAlbum = null,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!editingAlbum;

  // Form data
  const [formData, setFormData] = useState({
    titleVi: editingAlbum?.titleVi || "",
    titleEn: editingAlbum?.titleEn || "",
    descriptionVi: editingAlbum?.descriptionVi || "",
    descriptionEn: editingAlbum?.descriptionEn || "",
    status: editingAlbum?.status ?? 1,
    attachmentIds: editingAlbum?.attachmentIds || [],
    featuredImageId: editingAlbum?.featuredImageId || null,
    newsCategoryId: editingAlbum?.newsCategoryId || 1
  });

  // Upload state (similar to NewsCreationForm)
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [featuredImageId, setFeaturedImageId] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Sync formData when editingAlbum changes
  useEffect(() => {
    if (editingAlbum) {
      setFormData({
        titleVi: editingAlbum.titleVi || "",
        titleEn: editingAlbum.titleEn || "",
        descriptionVi: editingAlbum.descriptionVi || "",
        descriptionEn: editingAlbum.descriptionEn || "",
        status: editingAlbum.status ?? 1,
        attachmentIds: editingAlbum.attachmentIds || [],
        featuredImageId: editingAlbum.featuredImageId || null,
        newsCategoryId: editingAlbum.newsCategoryId || 1
      });
    }
  }, [editingAlbum]);

  // Load existing attachments if editing
  useEffect(() => {

    const loadExistingAttachments = async () => {
      if (isEditMode && editingAlbum) {
        try {
          // Load featured image from imageUrl
          const imageUrl = editingAlbum.imageUrl || editingAlbum.ImageUrl;
          if (imageUrl) {
            const fullImageUrl = imageUrl.startsWith("http")
              ? imageUrl
              : getApiUrl(imageUrl);
            setFeaturedImagePreview(fullImageUrl);
          }

          // Set featured image ID from BE response
          if (editingAlbum.featuredImageId !== null && editingAlbum.featuredImageId !== undefined) {
            setFeaturedImageId(editingAlbum.featuredImageId);
          }

          // Use attachments data if available in editingAlbum
          const attachmentImages = editingAlbum.attachments?.images || [];
          if (attachmentImages.length > 0) {
            const baseUrl = api.defaults.baseURL;
            const transformedImages = attachmentImages.map((img, index) => ({
              id: img.id,
              name: img.originalFileName || img.fileName || `image-${index + 1}`,
              size: img.fileSize || 0,
              type: "image/*",
              uploading: false,
              preview: img.url?.startsWith("http") 
                ? img.url 
                : `${baseUrl}${img.url || `/api/attachments/${img.id}`}`,
              attachmentId: img.id,
            }));
            setGalleryImages(transformedImages);
            
            // Update attachmentIds
            const attachmentIds = attachmentImages.map(img => img.id);
            handleInputChange("attachmentIds", attachmentIds);
          } else {
            // Fallback to API call if no attachments in editingAlbum
            const response = await albumService.getAlbumAttachments(editingAlbum.id);
            if (response.success && response.data) {
              const baseUrl = api.defaults.baseURL;
              const transformedImages = response.data.map((img, index) => ({
                id: img.id,
                name: img.originalFileName || img.fileName || `image-${index + 1}`,
                size: img.fileSize || 0,
                type: "image/*",
                uploading: false,
                preview: img.url?.startsWith("http") 
                  ? img.url 
                  : `${baseUrl}${img.url || `/api/attachments/${img.id}`}`,
                attachmentId: img.id,
              }));
              
              setGalleryImages(transformedImages);
              
              // Update attachmentIds
              const attachmentIds = response.data.map(img => img.id);
              handleInputChange("attachmentIds", attachmentIds);
            }
          }
        } catch (error) {}
      }
    };

    loadExistingAttachments();
  }, [isEditMode, editingAlbum]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  // Featured image upload handler
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

  // Handle image upload (improved like NewsCreationForm)
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);

      // Create image info objects với preview
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

      // Thêm tất cả vào gallery ngay với preview
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
            URL.revokeObjectURL(imageInfo.preview);
            return {
              success: true,
              imageInfo,
              attachmentId: attachmentData.id,
            };
          } else {
            throw new Error("Upload failed - invalid response");
          }
        } catch (uploadError) {
          // Remove failed image from gallery
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

      // Update attachmentIds với images đã upload thành công
      const successfulAttachmentIds = results
        .filter((r) => r.success)
        .map((r) => r.attachmentId);

      if (successfulAttachmentIds.length > 0) {
        const allAttachmentIds = [
          ...formData.attachmentIds,
          ...successfulAttachmentIds
        ];
        handleInputChange("attachmentIds", allAttachmentIds);
      }

      if (successCount > 0) {
        showToast(`Upload thành công ${successCount}/${fileArray.length} ảnh`, "success");
      }

      if (failCount > 0) {
        showToast(`${failCount} ảnh upload thất bại`, "error");
      }
    } catch (error) {
      showToast("Lỗi khi thêm ảnh vào album", "error");
    } finally {
      setUploadingImages(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validating form data
    
    if (!formData.titleVi.trim()) {
      newErrors.titleVi = "Tiêu đề tiếng Việt là bắt buộc";
    }
    
    const successfulImages = galleryImages.filter(img => img.attachmentId && !img.uploading);
    if (successfulImages.length === 0) {
      newErrors.attachmentIds = "Cần upload ít nhất 1 ảnh";
    }
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setToast({
        show: true,
        message: "Vui lòng kiểm tra lại thông tin",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get successful attachment IDs from gallery
      const successfulImages = galleryImages.filter(img => img.attachmentId && !img.uploading);
      const attachmentIds = successfulImages.map(img => img.attachmentId);

      const albumData = {
        titleVi: formData.titleVi,
        titleEn: formData.titleEn,
        attachmentIds: attachmentIds,
        featuredImageId: featuredImageId,
        newsCategoryId: formData.newsCategoryId,
        status: formData.status ?? 1
      };

      let response;
      if (isEditMode) {
        response = await albumService.updateAlbum(editingAlbum.id, albumData);
      } else {
        response = await albumService.createAlbum(albumData);
      }

      if (response.success) {
        showToast(
          isEditMode ? "Cập nhật album thành công" : "Tạo album thành công",
          "success"
        );
        
        // Call success callback immediately if truly successful  
        if (response.data && (response.data.id || response.data.data?.id)) {
          setTimeout(() => {
            onSuccess();
          }, 1500); // Longer delay to see logs
        } else {
          throw new Error('API returned success but no album data');
        }
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (error) {
      showToast("Lỗi lưu album: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const removeGalleryImage = (imageId) => {
    setGalleryImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove && imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  return (
    <div className="news-creation-form">
      <div>
        {/* Title Section */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Tiêu đề tiếng Việt <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.titleVi ? 'is-invalid' : ''}`}
              value={formData.titleVi}
              onChange={(e) => handleInputChange("titleVi", e.target.value)}
              placeholder="Nhập tiêu đề album..."
            />
            {errors.titleVi && (
              <div className="invalid-feedback">{errors.titleVi}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Tiêu đề tiếng Anh</label>
            <input
              type="text"
              className="form-control"
              value={formData.titleEn}
              onChange={(e) => handleInputChange("titleEn", e.target.value)}
              placeholder="Enter album title..."
            />
          </div>
        </div>


        {/* Status */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
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

        {/* Featured Image Section */}
        <div className="form-section">
          <h4>Ảnh đại diện album</h4>
          <div className="form-group">
            <label className="form-label">Tải lên ảnh đại diện</label>
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
                    alt="Ảnh đại diện album"
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

        {/* Gallery Images Section */}
        <div className="form-section">
          <h4>Thư viện ảnh album</h4>
          <div className="form-group">
            <label className="form-label">
              Tải lên ảnh cho album <span className="text-danger">*</span>
            </label>
            <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                handleImageUpload(files);
              }
            }}
            className={`form-control ${errors.attachmentIds ? 'is-invalid' : ''}`}
            disabled={uploadingImages}
          />
          <small className="form-text text-muted">
            Chọn nhiều ảnh để tạo album. Hỗ trợ JPG, PNG, GIF.
          </small>
          {errors.attachmentIds && (
            <div className="invalid-feedback">{errors.attachmentIds}</div>
          )}
          </div>
        </div>

        {/* Upload Progress */}
        {uploadingImages && (
          <div className="upload-progress uploading">
            <div className="spinner-border spinner-border-sm me-2"></div>
            Đang upload ảnh...
          </div>
        )}

        {/* Gallery Images Preview */}
        {galleryImages.length > 0 && (
          <div className="uploaded-files-section">
            <h6>Ảnh album: ({galleryImages.filter(img => !img.uploading).length}/{galleryImages.length} ảnh)</h6>
            <div className="gallery-images-grid">
              {galleryImages.map((img) => (
                <div key={img.id} className="gallery-image-item">
                  <div className="gallery-image-wrapper">
                    <img
                      src={img.preview}
                      alt={img.name}
                      className="gallery-image-preview"
                    />
                    {img.uploading && (
                      <div className="image-uploading-overlay">
                        <div className="spinner-border spinner-border-sm"></div>
                      </div>
                    )}
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeGalleryImage(img.id)}
                      title="Xóa ảnh"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="gallery-image-info">
                    <small className="image-name">
                      {img.name.length > 15 ? img.name.substring(0, 15) + '...' : img.name}
                    </small>
                    <small className="image-size">
                      {(img.size / 1024).toFixed(1)} KB
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading || uploadingImages}
          >
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            {isEditMode ? "Cập nhật Album" : "Tạo Album"}
          </button>
        </div>
      </div>

      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

export default AlbumCreationForm;