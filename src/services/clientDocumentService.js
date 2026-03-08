import api from "../api";

/**
 * Client Document Service - For public pages
 * API: /api/client/documents
 */

const clientDocumentService = {
  /**
   * Get financial documents
   * GET /api/client/documents/financial
   */
  getFinancialDocuments: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || 1,
        pageSize: params.pageSize || 10,
      };

      const response = await api.get('/api/client/documents/financial', { params: queryParams });

      // Handle response format: {status: 1, data: {...}, code: 200, message: 'Ok'}
      if (response.data && (response.data.status === 1 || response.data.code === 200) && response.data.data) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Invalid response format',
        data: { items: [], totalItems: 0 }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch financial documents',
        data: { items: [], totalItems: 0 }
      };
    }
  },

  /**
   * Get other documents
   * GET /api/client/documents/other
   */
  getOtherDocuments: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || 1,
        pageSize: params.pageSize || 10,
      };

      const response = await api.get('/api/client/documents/other', { params: queryParams });

      // Handle response format: {status: 1, data: {...}, code: 200, message: 'Ok'}
      if (response.data && (response.data.status === 1 || response.data.code === 200) && response.data.data) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Invalid response format',
        data: { items: [], totalItems: 0 }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch other documents',
        data: { items: [], totalItems: 0 }
      };
    }
  },

  /**
   * Get document detail by slug
   * GET /api/client/documents/{slug}
   */
  getDocumentBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/client/documents/${slug}`);

      // Handle response format: {status: 1, data: {...}, code: 200, message: 'Ok'}
      if (response.data && (response.data.status === 1 || response.data.code === 200)) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Document not found'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get document'
      };
    }
  },

  /**
   * Get document files by slug
   * GET /api/client/documents/{slug}/files
   */
  getDocumentFiles: async (slug) => {
    try {
      const response = await api.get(`/api/client/documents/${slug}/files`);

      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Files not found',
        data: []
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get document files',
        data: []
      };
    }
  }
};

export default clientDocumentService;
