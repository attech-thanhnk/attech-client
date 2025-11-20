import api from "../api";
import { getApiBaseUrl } from "../config/apiConfig";
import { encodeContentForApi } from "../utils/contentUtils";

// Get all service with pagination and filters
export async function fetchService(pageNumber = 1, pageSize = 10, keyword = "", filters = {}, sortConfig = null) {
  try {
    const params = {
      pageNumber,  // Changed from pageIndex
      pageSize,
      keyword      // Added keyword support
    };

    // Add filters if provided
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

    const response = await api.get("/api/service/find-all", { params });

    // Handle BE response format: camelCase
    if (response.data && response.data.status === 1 && response.data.data) {
      const dataObj = response.data.data;
      const result = {
        items: dataObj.items || [],
        totalItems: dataObj.totalItems || 0,  // Match backend property
        totalPages: Math.ceil((dataObj.totalItems || 0) / pageSize),
        currentPage: dataObj.page || pageNumber,  // Backend returns 'page'
        pageSize: dataObj.pageSize || pageSize,
      };
      return result;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    throw error;
  }
}

// Get service by ID - for editing (returns DetailServiceDto)
export const getServiceById = async (id) => {
  try {
    const response = await api.get(`/api/service/detail/${id}`);

    // Handle API format
    if (response.data && response.data.status === 1 && response.data.data) {
      return response.data.data; // Return DetailServiceDto directly
    }

    throw new Error("Invalid service detail response");
  } catch (error) {
    throw error;
  }
};

// Get service by slug - for admin preview (returns DetailServiceDto)  
export const getServiceBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/service/detail/slug/${slug}`);

    // Handle API format
    if (response.data && response.data.status === 1 && response.data.data) {
      return response.data.data; // Return DetailServiceDto directly
    }

    throw new Error("Invalid service detail response");
  } catch (error) {
    throw error;
  }
};

// Create service - FIXED to use JSON instead of FormData
export const createService = async (serviceData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(serviceData.contentVi || "");
    const encodedContentEn = encodeContentForApi(serviceData.contentEn || "");

    // JSON payload - NOT FormData
    const payload = {
      titleVi: serviceData.titleVi || "",
      titleEn: serviceData.titleEn || "",
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: serviceData.descriptionVi || "",
      descriptionEn: serviceData.descriptionEn || "",
      slugVi: serviceData.slugVi || "",  // Fixed casing
      slugEn: serviceData.slugEn || "",  // Fixed casing
      isOutstanding: serviceData.isOutstanding || false,

      // Status - fixed casing
      status: typeof serviceData.status === "number"
        ? serviceData.status
        : serviceData.status === "active" ? 1
        : serviceData.status === "inactive" ? 0
        : 1,

      timePosted: serviceData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: serviceData.featuredImageId ?? null,
      attachmentIds: serviceData.attachmentIds || []
    };

    const response = await api.post("/api/service/create", payload, {
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

// Update service - FIXED to use JSON instead of FormData
export const updateService = async (id, serviceData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(serviceData.contentVi || "");
    const encodedContentEn = encodeContentForApi(serviceData.contentEn || "");

    // JSON payload - ID only in URL, NOT in body
    const payload = {
      titleVi: serviceData.titleVi || "",
      titleEn: serviceData.titleEn || "",
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: serviceData.descriptionVi || "",
      descriptionEn: serviceData.descriptionEn || "",
      slugVi: serviceData.slugVi || "",  // Fixed casing
      slugEn: serviceData.slugEn || "",  // Fixed casing
      isOutstanding: serviceData.isOutstanding || false,

      // Status - fixed casing
      status: typeof serviceData.status === "number"
        ? serviceData.status
        : serviceData.status === "active" ? 1
        : serviceData.status === "inactive" ? 0
        : 1,

      timePosted: serviceData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: serviceData.featuredImageId ?? null,
      attachmentIds: serviceData.attachmentIds || []
    };

    const response = await api.put(`/api/service/update/${id}`, payload, {
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

// Delete service
export const deleteService = async (id) => {
  try {
    const response = await api.delete(`/api/service/delete/${id}`);
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
