import api from '../api';
import { getApiBaseUrl } from '../config/apiConfig';

const documentService = {
  /**
   * Fetch all documents
   */
  fetchDocuments: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        keyword: params.keyword || "",
        status: params.status,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        isOutstanding: params.isOutstanding
      };

      // Remove undefined/empty params
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      // Add sorting if provided
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
        queryParams.sortDirection = params.sortDirection || 'desc';
      }
      const response = await api.get('/api/news/documents', { params: queryParams });
      // Handle API response format
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
  },

  /**
   * Get document by ID
   */
  getDocumentById: async (documentId) => {
    try {const response = await api.get(`/api/news/documents/${documentId}`);
    if (response.data && response.data.status === 1) {
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
  },

  /**
   * Create new document
   */
  createDocument: async (documentData) => {
    try {
      const payload = {
        titleVi: documentData.titleVi,
        titleEn: documentData.titleEn || '',
        descriptionVi: documentData.descriptionVi || '',
        descriptionEn: documentData.descriptionEn || '',
        attachmentIds: documentData.attachmentIds || [],
        featuredImageId: documentData.featuredImageId || null,
        newsCategoryId: parseInt(documentData.newsCategoryId),
        timePosted: documentData.timePosted || new Date().toISOString(),
        status: documentData.status ?? 1
      };

      const response = await api.post('/api/news/create-document', payload);

      return {
        success: true,
        data: response.data,
        message: 'Tạo tài liệu thành công'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.Message || error.message || 'Lỗi tạo tài liệu';

      return {
        success: false,
        message: errorMessage,
        data: null,
        statusCode: error.response?.status,
        errorDetails: error.response?.data
      };
    }
  },

  /**
   * Update document
   */
  updateDocument: async (documentId, documentData) => {
    try {
      const payload = {
        titleVi: documentData.titleVi,
        titleEn: documentData.titleEn || '',
        descriptionVi: documentData.descriptionVi || '',
        descriptionEn: documentData.descriptionEn || '',
        attachmentIds: documentData.attachmentIds || [],
        featuredImageId: documentData.featuredImageId || null,
        newsCategoryId: parseInt(documentData.newsCategoryId),
        timePosted: documentData.timePosted || new Date().toISOString(),
        status: documentData.status ?? 1
      };

      const response = await api.put(`/api/news/update-document/${documentId}`, payload);

      return {
        success: true,
        data: response.data,
        message: 'Cập nhật tài liệu thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi cập nhật tài liệu',
        data: null,
        statusCode: error.response?.status,
        errorDetails: error.response?.data
      };
    }
  },

  /**
   * Delete document
   */
  deleteDocument: async (documentId) => {
    try {const response = await api.delete(`/api/news/delete/${documentId}`);return {
        success: true,
        data: response.data,
        message: 'Xóa tài liệu thành công'
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete document'
      };
    }
  },

  /**
   * Bulk delete documents
   */
  bulkDeleteDocuments: async (ids) => {
    try {
      await api.post('/api/documents/bulk-delete', { ids });
      return {
        success: true,
        message: `Xóa ${ids.length} tài liệu thành công`
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || 'Lỗi xóa tài liệu'
      };
    }
  },

  /**
   * Download document
   */
  downloadDocument: async (documentId, filename) => {
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
  },

  /**
   * Get attachments for document
   */
  getDocumentAttachments: async (documentId) => {
    try {
      const response = await api.get(`/api/attachments/entity/News/${documentId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tải file tài liệu',
        data: []
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
   * Helper: Generate document slug from Vietnamese text
   */
  generateSlug: (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  /**
   * Search documents
   */
  searchDocuments: async (query, options = {}) => {
    try {
      const params = new URLSearchParams({
        keyword: query,
        pageNumber: options.page || 1,
        pageSize: options.limit || 10,
        status: options.status !== undefined ? options.status : 1
      }).toString();

      const response = await api.get(`/api/news/documents?${params}`);
      
      if (response.data && response.data.status === 1 && response.data.data) {
        const dataObj = response.data.data;
        return {
          success: true,
          data: dataObj.items || [],
          total: dataObj.totalItems || 0
        };
      }
      
      return {
        success: false,
        message: 'Invalid search response',
        data: [],
        total: 0
      };
    } catch (error) {return {
        success: false,
        message: 'Lỗi tìm kiếm tài liệu',
        data: [],
        total: 0
      };
    }
  }
};

export default documentService;