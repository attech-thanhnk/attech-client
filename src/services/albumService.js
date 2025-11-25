import api from '../api';
import { getApiBaseUrl } from '../config/apiConfig';

/**
 * Album Service - API calls for album management
 * ✅ Sử dụng backend APIs có sẵn:
 * - GET /api/news/albums - Lấy danh sách albums  
 * - POST /api/news/create-album - Tạo album
 * - GET /api/news/albums/slug/{slug} - Album theo slug
 * - POST /api/attachments/upload-album - Upload ảnh album
 * - GET /api/attachments/entity/News/{id} - Lấy ảnh album
 */

const albumService = {
  /**
   * Fetch all albums (✅ API có sẵn: GET /api/news/albums)
   */
  fetchAlbums: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.page || 1,
        pageSize: params.limit || 20,
        keyword: params.search || ''
      };

      // Add filters if provided
      if (params.status !== undefined && params.status !== '') {
        queryParams.status = params.status === 'active' ? 1 : 0;
      }
      if (params.dateFrom) {
        queryParams.dateFrom = params.dateFrom;
      }
      if (params.dateTo) {
        queryParams.dateTo = params.dateTo;
      }

      // Add sorting if provided
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
        queryParams.sortDirection = params.sortDirection || 'desc';
      }

      const urlParams = new URLSearchParams(queryParams).toString();

      const response = await api.get(`/api/news/albums?${urlParams}`);

      // Handle response structure: { status: 1, data: { items: [...], total: 1 } }
      const responseData = response.data.data || response.data;
      const items = responseData.items || responseData || [];

      return {
        success: true,
        data: items,
        pagination: responseData.pagination || {},
        total: responseData.total || responseData.totalItems || items.length || 0
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi tải danh sách album',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Get album by ID
   */
  getAlbumById: async (id) => {
    try {
      const response = await api.get(`/api/news/albums/${id}`);// Handle response structure: { status: 1, data: { ... attachments: { images: [...] } } }
      const albumData = response.data.data || response.data;
      
      return {
        success: true,
        data: albumData
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi tải album',
        data: null
      };
    }
  },

  /**
   * Get album by slug (supports both Vi and En slugs)
   */
  getAlbumBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/news/albums/slug/${slug}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Không tìm thấy album',
        data: null
      };
    }
  },

  /**
   * Create new album with slug support
   */
  createAlbum: async (albumData) => {
    try {
      const payload = {
        titleVi: albumData.titleVi,
        titleEn: albumData.titleEn || '',
        attachmentIds: albumData.attachmentIds || [],
        featuredImageId: albumData.featuredImageId || null,
        newsCategoryId: albumData.newsCategoryId || 1,
        status: albumData.status ?? 1
      };

      console.log('📦 createAlbum payload:', JSON.stringify(payload, null, 2));

      const response = await api.post('/api/news/create-album', payload);

      return {
        success: true,
        data: response.data,
        message: 'Tạo album thành công'
      };
    } catch (error) {const errorMessage = error.response?.data?.message || error.response?.data?.Message || error.message || 'Lỗi tạo album';
      
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
   * Update album with slug support
   */
  updateAlbum: async (id, albumData) => {
    try {
      const payload = {
        titleVi: albumData.titleVi,
        titleEn: albumData.titleEn || '',
        attachmentIds: albumData.attachmentIds || [],
        featuredImageId: albumData.featuredImageId || null,
        newsCategoryId: albumData.newsCategoryId || 1,
        status: albumData.status ?? 1
      };

      console.log('🔄 Updating album ID:', id, 'with payload:', payload);

      const response = await api.put(`/api/news/update-album/${id}`, payload);

      return {
        success: true,
        data: response.data,
        message: 'Cập nhật album thành công'
      };
    } catch (error) {
      console.error('❌ Update album error - Full error:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || error.message || 'Lỗi cập nhật album',
        data: null,
        statusCode: error.response?.status,
        errorDetails: error.response?.data
      };
    }
  },

  /**
   * Delete album
   */
  deleteAlbum: async (id) => {
    try {
      const response = await api.delete(`/api/news/delete-album/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Xóa album thành công'
      };
    } catch (error) {
      console.error('❌ Delete album error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi xóa album'
      };
    }
  },

  /**
   * Bulk delete albums
   */
  bulkDeleteAlbums: async (ids) => {
    try {
      await api.post('/api/albums/bulk-delete', { ids });
      return {
        success: true,
        message: `Xóa ${ids.length} album thành công`
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi xóa albums'
      };
    }
  },

  /**
   * Upload images for album (✅ API có sẵn: POST /api/attachments/upload-album)
   */
  uploadImages: async (files, options = {}) => {
    try {
      const formData = new FormData();
      
      // ⭐ Sử dụng 'Images' như backend expect
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('Images', file));
      } else {
        formData.append('Images', files);
      }

      const response = await api.post('/api/attachments/upload-album', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Progress callback if needed
        onUploadProgress: options.onProgress || null
      });

      return {
        success: true,
        data: response.data.successUploads || response.data || [],
        message: `Upload ${Array.isArray(files) ? files.length : 1} ảnh thành công`
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi upload ảnh',
        data: []
      };
    }
  },

  /**
   * Get attachments for album (sử dụng News entity)
   */
  getAlbumAttachments: async (albumId) => {
    try {
      // ⭐ Sử dụng News entity vì Album = News với type đặc biệt
      const response = await api.get(`/api/attachments/entity/News/${albumId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi tải ảnh album',
        data: []
      };
    }
  },

  /**
   * Add images to existing album
   */
  addImagesToAlbum: async (albumId, attachmentIds) => {
    try {
      const response = await api.post(`/api/albums/${albumId}/attachments`, {
        attachmentIds
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Thêm ảnh vào album thành công'
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi thêm ảnh vào album'
      };
    }
  },

  /**
   * Remove image from album
   */
  removeImageFromAlbum: async (albumId, attachmentId) => {
    try {
      await api.delete(`/api/albums/${albumId}/attachments/${attachmentId}`);
      return {
        success: true,
        message: 'Xóa ảnh khỏi album thành công'
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi xóa ảnh khỏi album'
      };
    }
  },

  /**
   * Reorder images in album
   */
  reorderAlbumImages: async (albumId, attachmentIds) => {
    try {
      const response = await api.put(`/api/albums/${albumId}/reorder`, {
        attachmentIds
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Sắp xếp ảnh thành công'
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Lỗi sắp xếp ảnh'
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
   * Helper: Generate album slug from Vietnamese text
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
   * Search albums (public API)
   */
  searchAlbums: async (query, options = {}) => {
    try {
      const params = new URLSearchParams({
        q: query,
        page: options.page || 1,
        limit: options.limit || 12,
        status: 1 // Only published albums
      }).toString();

      const response = await api.get(`/api/albums/search?${params}`);
      return {
        success: true,
        data: response.data.items || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      };
    } catch (error) {return {
        success: false,
        message: 'Lỗi tìm kiếm album',
        data: [],
        total: 0
      };
    }
  }
};

export default albumService;