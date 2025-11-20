import api from "../api";
import { getApiBaseUrl } from "../config/apiConfig";
import { encodeContentForApi } from "../utils/contentUtils";

// Get all notification with pagination and filters
export async function fetchNotification(pageNumber = 1, pageSize = 10, keyword = "", filters = {}, sortConfig = null) {
  try {
    const params = {
      pageNumber,  // Changed from pageIndex
      pageSize,
      keyword      // Added keyword support
    };

    // Add filters if provided
    if (filters.category) {
      params.categoryId = filters.category;
    }
    if (filters.status) {
      params.status = filters.status === "active" ? 1 : 0;
    }
    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      params.dateTo = filters.dateTo;
    }

    // Add sorting if provided
    if (sortConfig?.key) {
      params.sortBy = sortConfig.key;
      params.sortDirection = sortConfig.direction || 'desc';
    }

    const response = await api.get("/api/notification/find-all", { params });

    // Handle BE response format: camelCase
    if (response.data && response.data.status === 1 && response.data.data) {
      const dataObj = response.data.data;
      const result = {
        items: dataObj.items || [],
        totalItems: dataObj.totalItems || 0,  // Match backend property
        totalPages: Math.ceil((dataObj.totalItems || 0) / pageSize),
        currentPage: dataObj.page || pageNumber,  // Backend returns 'page'
        pageSize,
      };
      return result;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    throw error;
  }
}

// Get notification categories - matches BE NotificationCategoryController
export async function fetchNotificationCategories() {
  try {
    const response = await api.get("/api/notification-category/find-all");

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data &&
      response.data.data.items
    ) {
      return response.data.data.items;
    }

    throw new Error("Invalid categories response");
  } catch (error) {throw error;
  }
}

// Get notification by ID - for editing (returns DetailNotificationDto)
export const getNotificationById = async (id) => {
  try {
    const response = await api.get(`/api/notification/detail/${id}`);

    // Handle API format
    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data; // Return DetailNotificationDto directly
    }

    throw new Error("Invalid notification detail response");
  } catch (error) {
    throw error;
  }
};

// Get notification by slug - for admin preview (returns DetailNotificationDto)  
export const getNotificationBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/notification/detail/slug/${slug}`);

    // Handle API format
    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data; // Return DetailNotificationDto directly
    }

    throw new Error("Invalid notification detail response");
  } catch (error) {
    throw error;
  }
};

// Create notification - FIXED to use JSON instead of FormData
export const createNotification = async (notificationData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(notificationData.contentVi || "");
    const encodedContentEn = encodeContentForApi(notificationData.contentEn || "");

    // JSON payload - NOT FormData
    const payload = {
      titleVi: notificationData.titleVi || "",
      titleEn: notificationData.titleEn || "",
      notificationCategoryId: notificationData.notificationCategoryId || 0,
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: notificationData.descriptionVi || "",
      descriptionEn: notificationData.descriptionEn || "",
      slugVi: notificationData.slugVi || "",  // Fixed casing
      slugEn: notificationData.slugEn || "",  // Fixed casing
      isOutstanding: notificationData.isOutstanding || false,

      // Status - fixed casing
      status: typeof notificationData.status === "number"
        ? notificationData.status
        : notificationData.status === "active" ? 1
        : notificationData.status === "inactive" ? 0
        : 1,

      timePosted: notificationData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: notificationData.featuredImageId ?? null,
      attachmentIds: notificationData.attachmentIds || []
    };

    const response = await api.post("/api/notification/create", payload, {
      headers: {
        "Content-Type": "application/json",  // Changed from multipart
      },
      timeout: 300000,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update notification - FIXED to use JSON instead of FormData
export const updateNotification = async (id, notificationData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(notificationData.contentVi || "");
    const encodedContentEn = encodeContentForApi(notificationData.contentEn || "");

    // JSON payload - ID only in URL, NOT in body
    const payload = {
      titleVi: notificationData.titleVi || "",
      titleEn: notificationData.titleEn || "",
      notificationCategoryId: notificationData.notificationCategoryId || 0,
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: notificationData.descriptionVi || "",
      descriptionEn: notificationData.descriptionEn || "",
      slugVi: notificationData.slugVi || "",  // Fixed casing
      slugEn: notificationData.slugEn || "",  // Fixed casing
      isOutstanding: notificationData.isOutstanding || false,

      // Status - fixed casing
      status: typeof notificationData.status === "number"
        ? notificationData.status
        : notificationData.status === "active" ? 1
        : notificationData.status === "inactive" ? 0
        : 1,

      timePosted: notificationData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: notificationData.featuredImageId ?? null,
      attachmentIds: notificationData.attachmentIds || []
    };

    const response = await api.put(`/api/notification/update/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",  // JSON not FormData
      },
      timeout: 300000,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/api/notification/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// ATTACHMENT API SERVICE - NEW: Using /api/attachments
// ============================================================

// Upload file temporarily - returns attachment ID
export const uploadFile = async (file, relationType = "image") => {
  try {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("RelationType", relationType);

    const response = await api.post("/api/attachments/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000,
    });

    // Handle API format
    if (response.data && response.data.status === 1) {
      return response.data.data; // Returns {id, previewUrl, fileName, etc}
    }

    throw new Error("Upload failed");
  } catch (error) {
    throw error;
  }
};

// ============================================================
// CHUYÊN DỤNG: UPLOAD ẢNH ĐẠI DIỆN
// ============================================================
export const uploadFeaturedImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("Image", imageFile);

    const response = await api.post(
      "/api/attachments/upload-featured",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000,
      }
    );

    // Handle API format
    if (response.data && response.data.status === 1) {
      return response.data.data;
    }

    throw new Error("Featured image upload failed");
  } catch (error) {
    throw error;
  }
};

// ============================================================
// CHUYÊN DỤNG: UPLOAD ALBUM ẢNH (NHIỀU ẢNH CÙNG LÚC)
// ============================================================
export const uploadAlbumImages = async (imageFiles) => {
  try {
    const formData = new FormData();

    // Append multiple image files
    imageFiles.forEach((file) => {
      formData.append("Images", file);
    });

    const response = await api.post("/api/attachments/upload-album", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 600000, // 10 minutes for multiple files
    });

    // Handle API format
    if (response.data && response.data.status === 1) {
      return response.data.data; // BulkUploadResponseDto
    }

    throw new Error("Album upload failed");
  } catch (error) {
    throw error;
  }
};

// ============================================================
// CHUYÊN DỤNG: UPLOAD FILE ĐÍNH KÈM (NHIỀU FILE BẤT KỲ)
// ============================================================
export const uploadAttachmentFiles = async (files) => {
  try {
    const formData = new FormData();

    // Append multiple files of any type
    files.forEach((file) => {
      formData.append("Files", file);
    });

    const response = await api.post(
      "/api/attachments/upload-attachments",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 600000, // 10 minutes for multiple files
      }
    );

    // Handle API format
    if (response.data && response.data.status === 1) {
      return response.data.data; // BulkUploadResponseDto
    }

    throw new Error("Attachment upload failed");
  } catch (error) {
    throw error;
  }
};

// ============================================================
// BULK UPLOAD TỔNG QUÁT
// ============================================================
export const bulkUploadFiles = async (files, relationType = "album") => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("Files", file);
    });
    formData.append("RelationType", relationType);

    const response = await api.post("/api/attachments/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 600000,
    });

    // Handle API format
    if (response.data && response.data.status === 1) {
      return response.data.data; // BulkUploadResponseDto
    }

    throw new Error("Bulk upload failed");
  } catch (error) {
    throw error;
  }
};


// Get attachments by entity
export const getAttachmentsByEntity = async (objectType, objectId) => {
  try {
    const response = await api.get(
      `/api/attachments/entity/${objectType}/${objectId}`
    );

    // Handle API format
    if (response.data && response.data.status === 1) {
      const dataObj = response.data.data;
      return dataObj || [];
    }

    return [];
  } catch (error) {
    return [];
  }
};

// Delete attachment
export const deleteAttachment = async (attachmentId) => {
  try {
    const response = await api.delete(`/api/attachments/${attachmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// NOTIFICATION CATEGORY API
// ============================================================

export const getNotificationCategories = async () => {
  try {
    const response = await api.get("/api/notification-category/find-all");

    // Handle API format
    if (response.data && response.data.status === 1) {
      const dataObj = response.data.data;
      return dataObj?.items || [];
    }

    return [];
  } catch (error) {
    throw error;
  }
};

export const createNotificationCategory = async (data) => {
  try {
    const response = await api.post("/api/notification-category/create", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNotificationCategory = async (data) => {
  try {
    const response = await api.put("/api/notification-category/update", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotificationCategory = async (id) => {
  try {
    const response = await api.delete(
      `/api/notification-category/delete/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// SPECIAL: UPLOAD CONTENT IMAGE FOR TINYMCE
// ============================================================
export const uploadContentImage = async (file, callback, failure) => {
  try {
    const result = await uploadFile(file, "content");
    const imageUrl = `${getApiBaseUrl()}${result.previewUrl}`;

    callback(imageUrl);
  } catch (error) {
    failure("Upload failed: " + error.message);
  }
};

