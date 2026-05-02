import api from "../api";
import { getApiBaseUrl } from "../config/apiConfig";

/**
 * ISO Documents Service - For managing ISO certification documents
 * Uses /api/iso-documents endpoints
 */

const isoDocumentService = {
  /**
   * Fetch all ISO documents (admin view - includes drafts)
   * Requires authentication + Admin role
   */
  fetchIsoDocuments: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        keyword: params.keyword || "",
        status: params.status, // 0: Draft, 1: Published
        certificateYear: params.certificateYear,
        isValid: params.isValid, // true: còn hạn, false: hết hạn
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      };

      // Remove undefined/empty params
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined || queryParams[key] === "") {
          delete queryParams[key];
        }
      });

      // Add sorting if provided
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
        queryParams.sortDirection = params.sortDirection || "desc";
      }

      const response = await api.get("/api/iso-documents", {
        params: queryParams,
      });

      // Handle API response format
      if (response.data && response.data.status === 1 && response.data.data) {
        const dataObj = response.data.data;
        return {
          success: true,
          data: {
            items: dataObj.items || [],
            totalItems: dataObj.totalItems || 0,
            totalPages: Math.ceil(
              (dataObj.totalItems || 0) / (params.pageSize || 10)
            ),
            currentPage: dataObj.page || params.page || 1,
            pageSize: dataObj.pageSize || params.pageSize || 10,
          },
        };
      }

      return {
        success: false,
        message: "Invalid response format",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch ISO documents",
      };
    }
  },

  /**
   * Get ISO document by ID
   */
  getIsoDocumentById: async (documentId) => {
    try {
      const response = await api.get(`/api/iso-documents/${documentId}`);

      if (response.data && response.data.status === 1) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: "ISO document not found",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to get ISO document detail",
      };
    }
  },

  /**
   * Create new ISO document
   */
  createIsoDocument: async (documentData) => {
    try {
      const payload = {
        titleVi: documentData.titleVi,
        titleEn: documentData.titleEn || "",
        descriptionVi: documentData.descriptionVi || "",
        descriptionEn: documentData.descriptionEn || "",
        certificateYear: documentData.certificateYear,
        expiryDate: documentData.expiryDate || null,
        attachmentIds: documentData.attachmentIds || [],
        status: documentData.status ?? 1,
        displayOrder: documentData.displayOrder || 0,
      };

      const response = await api.post("/api/iso-documents", payload);

      return {
        success: true,
        data: response.data,
        message: "Tạo chứng chỉ ISO thành công",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        error.message ||
        "Lỗi tạo chứng chỉ ISO";

      return {
        success: false,
        message: errorMessage,
        data: null,
        statusCode: error.response?.status,
        errorDetails: error.response?.data,
      };
    }
  },

  /**
   * Update ISO document
   */
  updateIsoDocument: async (documentId, documentData) => {
    try {
      const payload = {
        titleVi: documentData.titleVi,
        titleEn: documentData.titleEn || "",
        descriptionVi: documentData.descriptionVi || "",
        descriptionEn: documentData.descriptionEn || "",
        certificateYear: documentData.certificateYear,
        expiryDate: documentData.expiryDate || null,
        attachmentIds: documentData.attachmentIds || [],
        status: documentData.status ?? 1,
        displayOrder: documentData.displayOrder || 0,
      };

      const response = await api.put(
        `/api/iso-documents/${documentId}`,
        payload
      );

      return {
        success: true,
        data: response.data,
        message: "Cập nhật chứng chỉ ISO thành công",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.Message ||
          "Lỗi cập nhật chứng chỉ ISO",
        data: null,
        statusCode: error.response?.status,
        errorDetails: error.response?.data,
      };
    }
  },

  /**
   * Delete ISO document
   */
  deleteIsoDocument: async (documentId) => {
    try {
      const response = await api.delete(`/api/iso-documents/${documentId}`);

      return {
        success: true,
        data: response.data,
        message: "Xóa chứng chỉ ISO thành công",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete ISO document",
      };
    }
  },

  /**
   * Download ISO document
   */
  downloadIsoDocument: async (attachmentId, filename) => {
    try {
      const response = await api.get(
        `/api/attachments/download/${attachmentId}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to download ISO document"
      );
    }
  },

  /**
   * Get all published ISO documents (for public page)
   * Supports filtering and pagination
   */
  getPublishedIsoDocuments: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || params.pageNumber || 1,
        pageSize: params.pageSize || -1, // -1 to get all by default
        keyword: params.keyword,
        certificateYear: params.certificateYear,
        isValid: params.isValid, // true: còn hạn, false: hết hạn
        sortBy: params.sortBy || "displayOrder",
        sortDirection: params.sortDirection || "asc",
      };

      // Remove undefined/empty params
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined || queryParams[key] === "") {
          delete queryParams[key];
        }
      });

      const response = await api.get("/api/iso-documents/published", {
        params: queryParams,
      });

      if (response.data && response.data.status === 1) {
        // API returns data.data.items or data.data directly
        const responseData = response.data.data;
        const items = responseData?.items || responseData || [];

        return {
          success: true,
          data: items,
          totalItems: responseData?.totalItems || responseData?.total || items.length,
        };
      }

      return {
        success: false,
        message: "Failed to fetch published ISO documents",
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch published ISO documents",
        data: [],
      };
    }
  },

  /**
   * Helper: Get attachment URL
   */
  getAttachmentUrl: (attachmentId) => {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/api/attachments/${attachmentId}`;
  },

  /**
   * Search ISO documents
   */
  searchIsoDocuments: async (query, options = {}) => {
    try {
      const params = new URLSearchParams({
        keyword: query,
        pageNumber: options.page || 1,
        pageSize: options.limit || 10,
        status: options.status !== undefined ? options.status : 1,
      }).toString();

      const response = await api.get(`/api/iso-documents?${params}`);

      if (response.data && response.data.status === 1 && response.data.data) {
        const dataObj = response.data.data;
        return {
          success: true,
          data: dataObj.items || [],
          total: dataObj.totalItems || 0,
        };
      }

      return {
        success: false,
        message: "Invalid search response",
        data: [],
        total: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi tìm kiếm chứng chỉ ISO",
        data: [],
        total: 0,
      };
    }
  },
};

export default isoDocumentService;
