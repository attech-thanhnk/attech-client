import api from "../api";
import { getApiBaseUrl } from "../config/apiConfig";
import { encodeContentForApi } from "../utils/contentUtils";

// Get all news with pagination and filters
export async function fetchNews(pageNumber = 1, pageSize = 10, keyword = "", filters = {}, sortConfig = null) {
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

    const response = await api.get("/api/news/find-all", { params });

    // Handle BE response format: camelCase
    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
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

// Get news categories - matches BE NewsCategoryController
export async function fetchNewsCategories() {
  try {
    const response = await api.get("/api/news-category/find-all");
    
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

// Get news by ID - for editing (returns DetailNewsDto)
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/api/news/detail/${id}`);

    // Handle API format
    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data; // Return DetailNewsDto directly
    }

    throw new Error("Invalid news detail response");
  } catch (error) {
    throw error;
  }
};

// Get news by slug - for admin preview (returns DetailNewsDto)  
export const getNewsBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/news/detail/slug/${slug}`);

    // Handle API format
    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data; // Return DetailNewsDto directly
    }

    throw new Error("Invalid news detail response");
  } catch (error) {
    throw error;
  }
};

// Create news - FIXED to use JSON instead of FormData
export const createNews = async (newsData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(newsData.contentVi || "");
    const encodedContentEn = encodeContentForApi(newsData.contentEn || "");

    // JSON payload - NOT FormData
    const payload = {
      titleVi: newsData.titleVi || "",
      titleEn: newsData.titleEn || "",
      newsCategoryId: newsData.newsCategoryId || 0,
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: newsData.descriptionVi || "",
      descriptionEn: newsData.descriptionEn || "",
      slugVi: newsData.slugVi || "",  // Fixed casing
      slugEn: newsData.slugEn || "",  // Fixed casing
      isOutstanding: newsData.isOutstanding || false,

      // Status - fixed casing
      status: typeof newsData.status === "number"
        ? newsData.status
        : newsData.status === "active" ? 1
        : newsData.status === "inactive" ? 0
        : 1,

      timePosted: newsData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: newsData.featuredImageId ?? null,
      attachmentIds: newsData.attachmentIds || []
    };

    const response = await api.post("/api/news/create", payload, {
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

// Update news - FIXED to use JSON instead of FormData
export const updateNews = async (id, newsData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(newsData.contentVi || "");
    const encodedContentEn = encodeContentForApi(newsData.contentEn || "");

    // JSON payload - ID only in URL, NOT in body
    const payload = {
      titleVi: newsData.titleVi || "",
      titleEn: newsData.titleEn || "",
      newsCategoryId: newsData.newsCategoryId || 0,
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: newsData.descriptionVi || "",
      descriptionEn: newsData.descriptionEn || "",
      slugVi: newsData.slugVi || "",  // Fixed casing
      slugEn: newsData.slugEn || "",  // Fixed casing
      isOutstanding: newsData.isOutstanding || false,

      // Status - fixed casing
      status: typeof newsData.status === "number"
        ? newsData.status
        : newsData.status === "active" ? 1
        : newsData.status === "inactive" ? 0
        : 1,

      timePosted: newsData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: newsData.featuredImageId ?? null,
      attachmentIds: newsData.attachmentIds || []
    };

    const response = await api.put(`/api/news/update/${id}`, payload, {
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

// Delete news
export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/api/news/delete/${id}`);
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
// NEWS CATEGORY API
// ============================================================

export const getNewsCategories = async () => {
  try {
    const response = await api.get("/api/news-category/find-all");

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

export const createNewsCategory = async (data) => {
  try {
    const response = await api.post("/api/news-category/create", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNewsCategory = async (data) => {
  try {
    const response = await api.put("/api/news-category/update", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNewsCategory = async (id) => {
  try {
    const response = await api.delete(`/api/news-category/delete/${id}`);
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

// ============================================================
// DOCUMENT MANAGEMENT API
// ============================================================

// Get documents list
export const getDocuments = async (params = {}) => {
  try {
    const queryParams = {
      pageNumber: params.page || 1,
      pageSize: params.pageSize || 10,
      keyword: params.keyword || "",
      status: params.status || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined
    };

    // Add sorting if provided
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
      queryParams.sortDirection = params.sortDirection || 'desc';
    }const response = await api.get('/api/news/documents', { params: queryParams });// Handle API response format
    if (response.data && response.data.status === 1 && response.data.data) {
      const dataObj = response.data.data;
      return {
        success: true,
        data: {
          items: dataObj.items || [],
          totalItems: dataObj.totalItems || 0,
          totalPages: Math.ceil((dataObj.totalItems || 0) / (params.pageSize || 10)),
          currentPage: dataObj.page || (params.page || 1),
          pageSize: dataObj.pageSize || (params.pageSize || 10)
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid response format'
    };
  } catch (error) {return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch documents'
    };
  }
};

// Create document
export const createDocument = async (documentData) => {
  try {const response = await api.post('/api/news/create-document', documentData);return {
      success: true,
      data: response.data
    };
  } catch (error) {return {
      success: false,
      message: error.response?.data?.message || 'Failed to create document'
    };
  }
};

// Update document
export const updateDocument = async (documentId, documentData) => {
  try {const response = await api.put(`/api/news/update-document/${documentId}`, documentData);return {
      success: true,
      data: response.data
    };
  } catch (error) {return {
      success: false,
      message: error.response?.data?.message || 'Failed to update document'
    };
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {const response = await api.delete(`/api/news/delete/${documentId}`);return {
      success: true,
      data: response.data
    };
  } catch (error) {return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete document'
    };
  }
};

// Get document detail
export const getDocumentById = async (documentId) => {
  try {const response = await api.get(`/api/news/documents/${documentId}`);if (response.data && response.data.status === 1) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: 'Document not found'
    };
  } catch (error) {return {
      success: false,
      message: error.response?.data?.message || 'Failed to get document detail'
    };
  }
};

// Download document
export const downloadDocument = async (documentId, filename) => {
  try {const response = await api.get(`/api/attachments/download/${documentId}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);return { success: true };
  } catch (error) {throw new Error(error.response?.data?.message || 'Failed to download document');
  }
};

