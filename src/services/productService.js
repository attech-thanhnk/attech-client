import api from "../api";
import { getApiBaseUrl } from "../config/apiConfig";
import { encodeContentForApi } from "../utils/contentUtils";

// Get all product with pagination and filters
export async function fetchProduct(pageNumber = 1, pageSize = 10, keyword = "", filters = {}, sortConfig = null) {
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

    const response = await api.get("/api/product/find-all", { params });

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

// Get product categories - matches BE ProductCategoryController
export async function fetchProductCategories() {
  try {
    const response = await api.get("/api/product-category/find-all");

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

// Get product by ID - for editing (returns DetailProductDto)
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/product/detail/${id}`);

    // Handle API format
    if (response.data && response.data.status === 1 && response.data.data) {
      return response.data.data; // Return DetailProductDto directly
    }

    throw new Error("Invalid product detail response");
  } catch (error) {
    throw error;
  }
};

// Get product by slug - for admin preview (returns DetailProductDto)  
export const getProductBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/product/detail/slug/${slug}`);

    // Handle API format
    if (response.data && response.data.status === 1 && response.data.data) {
      return response.data.data; // Return DetailProductDto directly
    }

    throw new Error("Invalid product detail response");
  } catch (error) {
    throw error;
  }
};

// Create product - FIXED to use JSON instead of FormData
export const createProduct = async (productData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(productData.contentVi || "");
    const encodedContentEn = encodeContentForApi(productData.contentEn || "");

    // JSON payload - NOT FormData
    const payload = {
      titleVi: productData.titleVi || "",
      titleEn: productData.titleEn || "",
      productCategoryId: productData.productCategoryId || 0,
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: productData.descriptionVi || "",
      descriptionEn: productData.descriptionEn || "",
      slugVi: productData.slugVi || "",  // Fixed casing
      slugEn: productData.slugEn || "",  // Fixed casing
      isOutstanding: productData.isOutstanding || false,

      // Status - fixed casing
      status: typeof productData.status === "number"
        ? productData.status
        : productData.status === "active" ? 1
        : productData.status === "inactive" ? 0
        : 1,

      timePosted: productData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: productData.featuredImageId ?? null,
      attachmentIds: productData.attachmentIds || []
    };

    const response = await api.post("/api/product/create", payload, {
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

// Update product - FIXED to use JSON instead of FormData
export const updateProduct = async (id, productData) => {
  try {
    // 🔒 SECURITY: Encode HTML content to bypass XSS middleware
    const encodedContentVi = encodeContentForApi(productData.contentVi || "");
    const encodedContentEn = encodeContentForApi(productData.contentEn || "");

    // JSON payload - ID only in URL, NOT in body
    const payload = {
      titleVi: productData.titleVi || "",
      titleEn: productData.titleEn || "",
      productCategoryId: productData.productCategoryId || 0,
      contentVi: encodedContentVi,  // Base64 encoded
      contentEn: encodedContentEn,  // Base64 encoded
      descriptionVi: productData.descriptionVi || "",
      descriptionEn: productData.descriptionEn || "",
      slugVi: productData.slugVi || "",  // Fixed casing
      slugEn: productData.slugEn || "",  // Fixed casing
      isOutstanding: productData.isOutstanding || false,

      // Status - fixed casing
      status: typeof productData.status === "number"
        ? productData.status
        : productData.status === "active" ? 1
        : productData.status === "inactive" ? 0
        : 1,

      timePosted: productData.timePosted || new Date().toISOString(),

      // Attachments
      featuredImageId: productData.featuredImageId ?? null,
      attachmentIds: productData.attachmentIds || []
    };

    const response = await api.put(`/api/product/update/${id}`, payload, {
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

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/api/product/delete/${id}`);
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
// PRODUCT CATEGORY API
// ============================================================

export const getProductCategories = async () => {
  try {
    const response = await api.get("/api/product-category/find-all");

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

export const createProductCategory = async (data) => {
  try {
    const response = await api.post("/api/product-category/create", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProductCategory = async (data) => {
  try {
    const response = await api.put("/api/product-category/update", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProductCategory = async (id) => {
  try {
    const response = await api.delete(`/api/product-category/delete/${id}`);
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
