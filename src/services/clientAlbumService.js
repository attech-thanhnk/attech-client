import api from '../api';
import { getApiUrl } from '../config/apiConfig';

/**
 * Client Album Service - Public APIs for company gallery
 * 🎯 For "Thư viện công ty" in Company Introduction
 * 
 * API Endpoints:
 * - GET /api/client/albums - NewsDto[] (featured image only)
 * - GET /api/client/albums/{slug} - DetailNewsDto (full attachments)  
 * - GET /api/client/albums/{slug}/gallery - NewsGalleryDto (all images for slideshow)
 * - GET /api/client/albums/category/{categorySlug} - NewsDto[] (filter by category)
 * - GET /api/client/albums/featured - NewsDto[] (isOutstanding = true)
 */

const clientAlbumService = {
  /**
   * Album Gallery - List tất cả với thumbnail
   * GET /albums
   * 
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @returns {Promise} API response
   */
  getAlbums: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        pageNumber: params.page || 1,
        pageSize: params.limit || 12,
        keyword: params.search || '',
        status: 1 // Only published albums
      }).toString();

      const response = await api.get(`/api/client/albums?${queryParams}`);

      // Handle response: { status: 1, data: { items: NewsDto[], totalItems: number, page: number, pageSize: number } }
      const responseData = response.data.data || response.data;

      return {
        success: true,
        data: responseData.items || [],
        pagination: {
          page: responseData.page || 1,
          pageSize: responseData.pageSize || 12,
          totalItems: responseData.totalItems || 0
        },
        total: responseData.totalItems || responseData.total || 0
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tải danh sách album',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Album Detail - Full info + attachments
   * GET /albums/{slug}
   * 
   * @param {string} slug - Album slug (Vi or En)
   * @returns {Promise} API response
   */
  getAlbumBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/client/albums/${slug}`);// Handle response: { status: 1, data: DetailNewsDto }
      const albumData = response.data.data || response.data;
      
      return {
        success: true,
        data: albumData
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || 'Không tìm thấy album',
        data: null
      };
    }
  },

  /**
   * Lightbox/Slider - Chỉ ảnh, load nhanh
   * GET /albums/{slug}/gallery
   * 
   * @param {string} slug - Album slug
   * @returns {Promise} API response
   */
  getAlbumGallery: async (slug) => {
    try {
      const response = await api.get(`/api/client/albums/${slug}/gallery`);// Handle response: { status: 1, data: NewsGalleryDto }
      const galleryData = response.data.data || response.data;// Try different possible structures
      let images = [];
      if (galleryData.images && Array.isArray(galleryData.images)) {
        images = galleryData.images;
      } else if (galleryData.attachments && galleryData.attachments.images) {
        images = galleryData.attachments.images;
      } else if (Array.isArray(galleryData)) {
        images = galleryData;
      }return {
        success: true,
        data: images,
        albumTitle: galleryData.albumTitle,
        albumSlug: galleryData.albumSlug
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tải thư viện ảnh',
        data: []
      };
    }
  },

  /**
   * Search albums (public)
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} API response
   */
  searchAlbums: async (query, options = {}) => {
    try {
      const params = new URLSearchParams({
        q: query,
        page: options.page || 1,
        limit: options.limit || 12,
        status: 1 // Only published albums
      }).toString();

      const response = await api.get(`/api/client/albums/search?${params}`);
      const responseData = response.data.data || response.data;
      
      return {
        success: true,
        data: responseData.items || [],
        pagination: {
          page: responseData.page || 1,
          pageSize: responseData.pageSize || 12,
          totalItems: responseData.totalItems || 0
        },
        total: responseData.totalItems || 0
      };
    } catch (error) {return {
        success: false,
        message: 'Lỗi tìm kiếm album',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Category Page - Filter theo danh mục  
   * GET /api/client/albums/category/{categorySlug}
   * 
   * @param {string} categorySlug - Category slug
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getAlbumsByCategory: async (categorySlug, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        pageSize: params.pageSize || 12,
        search: params.search || ''
      }).toString();

      const response = await api.get(`/api/client/albums/category/${categorySlug}?${queryParams}`);// Handle response: { status: 1, data: { items: NewsDto[], totalItems: number } }
      const responseData = response.data.data || response.data;
      
      return {
        success: true,
        data: responseData.items || [],
        pagination: {
          page: responseData.page || 1,
          pageSize: responseData.pageSize || 12,
          totalItems: responseData.totalItems || 0
        },
        total: responseData.totalItems || 0,
        category: responseData.category || null
      };
    } catch (error) {return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tải album theo danh mục',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Homepage - Albums nổi bật (isOutstanding = true)
   * GET /api/client/albums/featured
   * 
   * @param {number} limit - Number of featured albums
   * @returns {Promise} API response
   */
  getFeaturedAlbums: async (limit = 6) => {
    try {
      const response = await api.get(`/api/client/albums/featured?limit=${limit}`);// Handle response: { status: 1, data: { items: NewsDto[] } }
      const responseData = response.data.data || response.data;
      
      return {
        success: true,
        data: responseData.items || []
      };
    } catch (error) {// Fallback to regular albums if featured endpoint doesn't exist
      return await clientAlbumService.getAlbums({ limit });
    }
  },

  /**
   * Helper: Get full image URL
   *
   * @param {string} imageUrl - Image URL from API
   * @returns {string} Full image URL
   */
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Dùng getApiUrl từ apiConfig để xử lý đúng cả dev và production
    return getApiUrl(imageUrl);
  },

  /**
   * Helper: Format album for display
   * 
   * @param {Object} album - Raw album data
   * @param {string} language - Display language ('vi' | 'en')
   * @returns {Object} Formatted album
   */
  formatAlbumForDisplay: (album, language = 'vi') => {
    if (!album) return null;

    return {
      id: album.id,
      slug: language === 'vi' ? album.slugVi : album.slugEn,
      title: language === 'vi' ? album.titleVi : album.titleEn,
      description: language === 'vi' ? album.descriptionVi : album.descriptionEn,
      featuredImage: clientAlbumService.getImageUrl(album.imageUrl),
      imageCount: album.totalImages || album.attachments?.images?.length || 0,
      createdAt: album.createdAt || album.timePosted,
      category: {
        id: album.categoryId,
        name: language === 'vi' ? album.categoryNameVi : album.categoryNameEn,
        slug: language === 'vi' ? album.categorySlugVi : album.categorySlugEn
      },
      attachments: album.attachments || { images: [], documents: [] }
    };
  }
};

export default clientAlbumService;