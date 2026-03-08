import api from '../api';

/**
 * Video Service - API calls for video management
 * Admin APIs: /api/videos (requires auth + role 2)
 * Client API: /api/client/videos (public)
 */

const videoService = {
  /**
   * Fetch videos for admin (requires auth)
   * GET /api/videos?pageNumber=1&pageSize=10&keyword=abc
   */
  fetchVideos: async (params = {}) => {
    try {
      const queryParams = {
        ...params,
        pageNumber: params.page || 1,
        pageSize: params.limit || 10,
        keyword: params.search || params.keyword,
      };

      if (params.status !== undefined && params.status !== "") {
        queryParams.status = params.status;
      }

      // Use axios params for better encoding and cleaner code
      const response = await api.get("/api/videos", { params: queryParams });

      // Handle response format: support both standard 'status: 1' and specific 'statusCode: 200'
      if (
        response.data &&
        (response.data.status === 1 || response.data.statusCode === 200)
      ) {
        const responseData = response.data.data || {};
        const items = Array.isArray(responseData)
          ? responseData
          : responseData.items || [];

        return {
          success: true,
          data: items,
          total: responseData.totalItems || responseData.total || items.length,
          page: responseData.page || params.page || 1,
          pageSize: responseData.pageSize || params.limit || 10,
        };
      }

      return {
        success: false,
        message: response.data?.message || "Lỗi tải danh sách video",
        data: [],
        total: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi kết nối server",
        data: [],
        total: 0,
      };
    }
  },

  /**
   * Get video by ID
   * GET /api/videos/{id}
   */
  getVideoById: async (id) => {
    try {
      const response = await api.get(`/api/videos/${id}`);

      if (
        response.data &&
        (response.data.status === 1 || response.data.statusCode === 200)
      ) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data?.message || "Không tìm thấy video",
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi tải video",
        data: null,
      };
    }
  },

  /**
   * Create new video
   * POST /api/videos
   */
  createVideo: async (videoData) => {
    try {
      const payload = {
        titleVi: videoData.titleVi,
        titleEn: videoData.titleEn || "",
        descriptionVi: videoData.descriptionVi || "",
        descriptionEn: videoData.descriptionEn || "",
        youtubeId: videoData.youtubeId,
        thumbnail: videoData.thumbnail || null,
        status: videoData.status ?? 1,
        order: videoData.order ?? 0,
      };

      const response = await api.post("/api/videos", payload);

      if (
        response.data &&
        (response.data.status === 1 ||
          response.data.statusCode === 200 ||
          response.data.statusCode === 201)
      ) {
        return {
          success: true,
          data: response.data.data,
          message: "Tạo video thành công",
        };
      }

      return {
        success: false,
        message: response.data?.message || "Lỗi tạo video",
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi tạo video",
        data: null,
      };
    }
  },

  /**
   * Update video
   * PUT /api/videos/{id}
   */
  updateVideo: async (id, videoData) => {
    try {
      const payload = {
        titleVi: videoData.titleVi,
        titleEn: videoData.titleEn || "",
        descriptionVi: videoData.descriptionVi || "",
        descriptionEn: videoData.descriptionEn || "",
        youtubeId: videoData.youtubeId,
        thumbnail: videoData.thumbnail || null,
        status: videoData.status ?? 1,
        order: videoData.order ?? 0,
      };

      const response = await api.put(`/api/videos/${id}`, payload);

      if (
        response.data &&
        (response.data.status === 1 || response.data.statusCode === 200)
      ) {
        return {
          success: true,
          data: response.data.data,
          message: "Cập nhật video thành công",
        };
      }

      return {
        success: false,
        message: response.data?.message || "Lỗi cập nhật video",
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi cập nhật video",
        data: null,
      };
    }
  },

  /**
   * Delete video
   * DELETE /api/videos/{id}
   */
  deleteVideo: async (id) => {
    try {
      const response = await api.delete(`/api/videos/${id}`);

      if (
        response.data &&
        (response.data.status === 1 || response.data.statusCode === 200)
      ) {
        return {
          success: true,
          message: "Xóa video thành công",
        };
      }

      return {
        success: false,
        message: response.data?.message || "Lỗi xóa video",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi xóa video",
      };
    }
  },

  /**
   * Fetch videos for client (public)
   * GET /api/client/videos?pageNumber=1&pageSize=10
   */
  fetchClientVideos: async (params = {}) => {
    try {
      const queryParams = {
        pageNumber: params.pageNumber || params.page || 1,
        pageSize: params.pageSize || params.limit || 50,
        ...params,
      };

      const response = await api.get("/api/client/videos", {
        params: queryParams,
      });

      if (
        response.data &&
        (response.data.status === 1 || response.data.statusCode === 200)
      ) {
        const responseData = response.data.data || {};
        const items = Array.isArray(responseData)
          ? responseData
          : responseData.items || [];

        return {
          success: true,
          data: items,
          total: responseData.totalItems || responseData.total || items.length,
          page: responseData.page || queryParams.pageNumber,
          pageSize: responseData.pageSize || queryParams.pageSize,
        };
      }

      return {
        success: false,
        message: response.data?.message || "Lỗi tải danh sách video",
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi kết nối server",
        data: [],
      };
    }
  },

  /**
   * Helper: Extract YouTube ID from URL
   */
  extractYoutubeId: (url) => {
    if (!url) return "";

    // Already an ID (11 characters, alphanumeric with - and _)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return url; // Return as-is if no pattern matches
  },

  /**
   * Helper: Get YouTube thumbnail URL
   */
  getYoutubeThumbnail: (youtubeId, quality = "maxresdefault") => {
    if (!youtubeId) return "";
    // quality options: maxresdefault, hqdefault, mqdefault, sddefault
    return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
  },

  /**
   * Helper: Get YouTube embed URL
   */
  getYoutubeEmbedUrl: (youtubeId, autoplay = false) => {
    if (!youtubeId) return "";
    return `https://www.youtube.com/embed/${youtubeId}${autoplay ? "?autoplay=1" : ""
      }`;
  },
};

export default videoService;
