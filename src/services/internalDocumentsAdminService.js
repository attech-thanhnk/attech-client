import api from "../api";

/**
 * Internal Documents Admin Service - For admin CRUD operations
 * Uses /api/internal-documents endpoints
 */

const internalDocumentsAdminService = {
  /**
   * Fetch all internal documents (admin view - includes drafts)
   */
  fetchInternalDocuments: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        keyword: params.keyword || "",
        category: params.category,
        status: params.status,
        expiryStatus: params.expiryStatus,
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

      // Fetching internal documents (admin)
      const response = await api.get("/api/internal-documents/find-all", {
        params: queryParams,
      });// Handle API response format
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
    } catch (error) {return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch internal documents",
      };
    }
  },

  /**
   * Get internal document by ID (admin view)
   */
  getInternalDocumentById: async (documentId) => {
    try {const response = await api.get(
        `/api/internal-documents/find-by-id/${documentId}`
      );if (response.data && response.data.status === 1) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: "Internal document not found",
      };
    } catch (error) {return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to get internal document detail",
      };
    }
  },

  /**
   * Create new internal document
   */
  createInternalDocument: async (documentData) => {
    try {const payload = {
        title: documentData.title,
        description: documentData.description || "",
        category: documentData.category,
        attachmentId: documentData.attachmentId || null, // Single attachmentId now
        status: documentData.status || 1,
        expiryStatus: documentData.expiryStatus !== undefined ? documentData.expiryStatus : 0,
        timePosted: documentData.timePosted || null,
      };const response = await api.post(
        "/api/internal-documents/create",
        payload
      );return {
        success: true,
        data: response.data,
        message: "Tạo tài liệu nội bộ thành công",
      };
    } catch (error) {const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        error.message ||
        "Lỗi tạo tài liệu nội bộ";

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
   * Update internal document
   */
  updateInternalDocument: async (documentId, documentData) => {
    try {const payload = {
        title: documentData.title,
        description: documentData.description || "",
        category: documentData.category,
        attachmentId: documentData.attachmentId || null, // Single attachmentId now
        status: documentData.status || 1,
        expiryStatus: documentData.expiryStatus !== undefined ? documentData.expiryStatus : 0,
        timePosted: documentData.timePosted || null,
      };const response = await api.put(
        `/api/internal-documents/update/${documentId}`,
        payload
      );return {
        success: true,
        data: response.data,
        message: "Cập nhật tài liệu nội bộ thành công",
      };
    } catch (error) {return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.Message ||
          "Lỗi cập nhật tài liệu nội bộ",
        data: null,
        statusCode: error.response?.status,
        errorDetails: error.response?.data,
      };
    }
  },

  /**
   * Delete internal document
   */
  deleteInternalDocument: async (documentId) => {
    try {const response = await api.delete(
        `/api/internal-documents/delete/${documentId}`
      );return {
        success: true,
        data: response.data,
        message: "Xóa tài liệu nội bộ thành công",
      };
    } catch (error) {return {
        success: false,
        message:
          error.response?.data?.message || "Failed to delete internal document",
      };
    }
  },

  /**
   * Download internal document
   */
  downloadInternalDocument: async (documentId, filename) => {
    try {const response = await api.get(
        `/api/internal-documents/download/${documentId}`,
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
      window.URL.revokeObjectURL(url);return { success: true };
    } catch (error) {throw new Error(
        error.response?.data?.message || "Failed to download internal document"
      );
    }
  },

  /**
   * Get categories list
   */
  getInternalDocumentCategories: () => {
    return [
      { value: "to-chuc-bo-may", label: "Tổ chức bộ máy" },
      { value: "quan-ly-hanh-chinh", label: "Quản lý hành chính" },
      { value: "quan-ly-nhan-su", label: "Quản lý nhân sự" },
      { value: "quan-ly-tai-chinh", label: "Quản lý tài chính" },
      { value: "quan-ly-ky-thuat", label: "Quản lý kỹ thuật & KHCN" },
      { value: "van-ban-cong-ty", label: "Văn bản Công ty" },
      { value: "van-ban-nhan-su", label: "Văn bản về nhân sự" },
      {
        value: "van-ban-chk-va-bo-xay-dung",
        label: "Văn bản CHK và Bộ Xây dựng",
      },
      { value: "he-thong-dinh-muc", label: "Hệ thống định mức" },
      { value: "van-ban-cac-don-vi-khac", label: "Văn bản các đơn vị khác" },
      { value: "van-ban-cong-doan", label: "Văn bản công đoàn" },
      { value: "so-tay-nhan-vien", label: "Sổ tay nhân viên" },
    ];
  },

  /**
   * Search internal documents
   */
  searchInternalDocuments: async (query, options = {}) => {
    try {
      const params = new URLSearchParams({
        keyword: query,
        pageNumber: options.page || 1,
        pageSize: options.limit || 10,
        status: options.status !== undefined ? options.status : 1,
      }).toString();

      const response = await api.get(
        `/api/internal-documents/find-all?${params}`
      );

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
    } catch (error) {return {
        success: false,
        message: "Lỗi tìm kiếm tài liệu nội bộ",
        data: [],
        total: 0,
      };
    }
  },
};

export default internalDocumentsAdminService;
