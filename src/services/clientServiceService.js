import api from "../api";
import { getApiBaseUrl } from "../config/apiConfig";
import { processWysiwygContent } from "../utils/contentUtils";

// Service does not use categories per requirements

// Get all services for client-side with pagination and filters
export async function getServices(params = {}) {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      search = "",
      sortBy = "timePosted",
      sortDirection = "desc"
    } = params;

    const queryParams = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    };

    // Add optional filters
    if (search) queryParams.search = search;
    // Status = 1 is automatically handled by client endpoint

    const response = await api.get("/api/service/client/find-all", {
      params: queryParams,
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      const dataObj = response.data.data;
      return {
        success: true,
        data: dataObj.items || [],
        totalCount: dataObj.totalItems || dataObj.total || 0,
        totalPages: Math.ceil((dataObj.totalItems || dataObj.total || 0) / pageSize),
        currentPage: pageNumber,
        pageSize,
      };
    }

    return {
      success: false,
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: pageNumber,
      pageSize,
    };
  } catch (error) {return {
      success: false,
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
    };
  }
}

// Get service by ID for detail page
export async function getServiceById(id) {
  try {
    const response = await api.get(`/api/service/client/detail/${id}`);

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    throw new Error("Service not found");
  } catch (error) {throw error;
  }
}

// Get service by slug for SEO-friendly URLs
export async function getServiceBySlug(slug, language = "vi") {
  try {
    // Use client detail endpoint
    const response = await api.get(`/api/service/client/detail/${slug}`);

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    throw new Error("Service not found");
  } catch (error) {// No fallback needed for client endpoint - it only returns published content
    throw error;
  }
}

// Get featured/outstanding services
export async function getFeaturedServices(limit = 6) {
  try {
    const response = await api.get("/api/service/client/find-all", {
      params: {
        pageNumber: 1,
        pageSize: limit,
        isOutstanding: true,
        sortBy: "timePosted",
        sortDirection: "desc"
      }
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data.items || [];
    }

    return [];
  } catch (error) {return [];
  }
}

// Get latest services
export async function getLatestServices(limit = 10) {
  try {
    const response = await api.get("/api/service/client/find-all", {
      params: {
        pageNumber: 1,
        pageSize: limit,
        sortBy: "timePosted",
        sortDirection: "desc"
      }
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data.items || [];
    }

    return [];
  } catch (error) {return [];
  }
}

// Get related services
export async function getRelatedServices(serviceId, limit = 4) {
  try {
    const response = await api.get("/api/service/client/related", {
      params: { serviceId, limit }
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return [];
  } catch (error) {return [];
  }
}


// Search services
export async function searchServices(searchTerm, params = {}) {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "timePosted",
      sortDirection = "desc"
    } = params;

    const queryParams = {
      search: searchTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    };

    const response = await api.get("/api/service/client/find-all", {
      params: queryParams,
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      const dataObj = response.data.data;
      return {
        items: dataObj.items || [],
        totalCount: dataObj.totalItems || dataObj.total || 0,
        totalPages: Math.ceil((dataObj.totalItems || dataObj.total || 0) / pageSize),
        currentPage: pageNumber,
        pageSize,
      };
    }

    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
    };
  } catch (error) {return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
    };
  }
}


// Get service statistics
export async function getServiceStats() {
  try {
    const response = await api.get("/api/service/client/stats");

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return {
      totalServices: 0,
      totalCategories: 0,
      featuredServices: 0
    };
  } catch (error) {return {
      totalServices: 0,
      totalCategories: 0,
      featuredServices: 0
    };
  }
}

// Get services for sitemap
export async function getServicesForSitemap() {
  try {
    const response = await api.get("/api/service/client/sitemap");

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return [];
  } catch (error) {return [];
  }
}

// Get service breadcrumbs
export async function getServiceBreadcrumbs(serviceId) {
  try {
    const response = await api.get(`/api/service/client/breadcrumbs/${serviceId}`);

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return [];
  } catch (error) {return [];
  }
}

// Get service tags
export async function getServiceTags() {
  try {
    const response = await api.get("/api/service/client/tags");

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return [];
  } catch (error) {return [];
  }
}

// Get services by tag
export async function getServicesByTag(tag, params = {}) {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "timePosted",
      sortDirection = "desc"
    } = params;

    const queryParams = {
      tag,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    };

    const response = await api.get("/api/service/client/by-tag", {
      params: queryParams,
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      const dataObj = response.data.data;
      return {
        items: dataObj.items || [],
        totalCount: dataObj.totalItems || dataObj.total || 0,
        totalPages: Math.ceil((dataObj.totalItems || dataObj.total || 0) / pageSize),
        currentPage: pageNumber,
        pageSize,
      };
    }

    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
    };
  } catch (error) {return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
    };
  }
}

// Get service pricing
export async function getServicePricing(serviceId) {
  try {
    const response = await api.get(`/api/service/client/pricing/${serviceId}`);

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return null;
  } catch (error) {return null;
  }
}

// Get service testimonials
export async function getServiceTestimonials(serviceId, limit = 5) {
  try {
    const response = await api.get(`/api/service/client/testimonials/${serviceId}`, {
      params: { limit }
    });

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return [];
  } catch (error) {return [];
  }
}

// Get service FAQ
export async function getServiceFAQ(serviceId) {
  try {
    const response = await api.get(`/api/service/client/faq/${serviceId}`);

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data
    ) {
      return response.data.data;
    }

    return [];
  } catch (error) {return [];
  }
}


// Get service image URL helper
export function getServiceImageUrl(serviceItem) {
  if (!serviceItem) return null;
  
  // Try different possible image fields
  const imageUrl = serviceItem.ImageUrl || serviceItem.imageUrl || serviceItem.image;
  
  // Check for empty string or null/undefined
  if (!imageUrl || imageUrl.trim() === '') return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Handle frontend assets (hiện tại)
  if (imageUrl.startsWith('/assets/')) {
    return imageUrl; // Frontend sẽ serve từ public/assets
  }
  
  // Handle backend uploads (tương lai - like news)
  if (imageUrl.startsWith('/uploads/')) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${imageUrl}`;
  }
  
  // Fallback: treat as backend path
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${imageUrl}`;
}

// Format service data for client display
export function formatServiceForDisplay(serviceItem, language = "vi") {
  if (!serviceItem) return null;
  
  const isVietnamese = language === "vi";
  let displayContent = isVietnamese ? (serviceItem.contentVi || serviceItem.contentEn) : (serviceItem.contentEn || serviceItem.contentVi);
  
  // Process WYSIWYG content to convert relative image paths to full URLs
  displayContent = processWysiwygContent(displayContent);
  
  return {
    ...serviceItem,
    displayTitle: isVietnamese ? (serviceItem.titleVi || serviceItem.titleEn) : (serviceItem.titleEn || serviceItem.titleVi),
    displayDescription: isVietnamese ? (serviceItem.descriptionVi || serviceItem.descriptionEn) : (serviceItem.descriptionEn || serviceItem.descriptionVi),
    displayContent,
    displaySlug: isVietnamese ? (serviceItem.slugVi || serviceItem.slugEn) : (serviceItem.slugEn || serviceItem.slugVi),
    imageUrl: getServiceImageUrl(serviceItem),
    formattedDate: serviceItem.timePosted ? new Date(serviceItem.timePosted).toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US') : "",
    language: language
  };
}
