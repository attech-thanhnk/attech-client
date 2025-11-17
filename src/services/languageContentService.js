import api from "../api";

// Cache categories để tránh gọi API nhiều lần
let cachedCategories = null;

// Cache for client translations với long cache (API có LongCache)
let translationsCache = {
  data: null,
  timestamp: null,
  expiry: 30 * 60 * 1000, // 30 phút cache
};

// Get all language contents with pagination and filters
export async function fetchLanguageContents(
  pageNumber = 1,
  pageSize = 20,
  keyword = "",
  filters = {},
  sortConfig = null
) {
  try {
    const params = {
      pageNumber,
      pageSize,
      keyword,
    };

    // Add sorting if provided
    if (sortConfig?.key) {
      params.sortBy = sortConfig.key;
      params.sortDirection = sortConfig.direction || "desc";
    }

    // Add filters if provided
    if (filters.category) {
      // If category is a number (ID), use it directly
      // If category is a string (name), find the corresponding ID from categories API
      if (typeof filters.category === "number") {
        params.categoryId = filters.category;
      } else if (typeof filters.category === "string") {
        try {
          // Get categories to map name to ID (with caching)
          if (!cachedCategories) {
            cachedCategories = await fetchLanguageContentCategories();
          }

          const categoryItem = cachedCategories.find(
            (cat) => cat.name === filters.category
          );
          if (categoryItem && categoryItem.id) {
            params.categoryId = categoryItem.id;
          } else {
          }
        } catch (err) {
          // Skip category filter if mapping fails
        }
      }
    }

    const response = await api.get("/api/language-contents/find-all", {
      params,
    });

    // Handle BE response format
    if (response.data && response.data.status === 1 && response.data.data) {
      const dataObj = response.data.data;
      const result = {
        items: dataObj.items || [],
        totalItems: dataObj.totalItems || 0,
        totalPages: Math.ceil((dataObj.totalItems || 0) / pageSize),
        currentPage: dataObj.page || pageNumber,
        pageSize: dataObj.pageSize || pageSize,
      };
      return result;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    throw error;
  }
}

// Get language content categories
export async function fetchLanguageContentCategories() {
  try {
    const response = await api.get("/api/language-content-categories/find-all");

    if (
      response.data &&
      response.data.status === 1 &&
      response.data.data &&
      response.data.data.items
    ) {
      return response.data.data.items;
    }

    // Return default categories if API fails
    return [
      { id: 1, name: "common", displayName: "Common" },
      { id: 2, name: "navigation", displayName: "Navigation" },
      { id: 3, name: "auth", displayName: "Authentication" },
      { id: 4, name: "admin", displayName: "Admin" },
      { id: 5, name: "frontend", displayName: "Frontend" },
      { id: 6, name: "validation", displayName: "Validation" },
      { id: 7, name: "errors", displayName: "Errors" },
    ];
  } catch (error) {
    // Return default categories on error
    return [
      { id: 1, name: "common", displayName: "Common" },
      { id: 2, name: "navigation", displayName: "Navigation" },
      { id: 3, name: "auth", displayName: "Authentication" },
      { id: 4, name: "admin", displayName: "Admin" },
      { id: 5, name: "frontend", displayName: "Frontend" },
      { id: 6, name: "validation", displayName: "Validation" },
      { id: 7, name: "errors", displayName: "Errors" },
    ];
  }
}

// Create new language content
export async function createLanguageContent(contentData) {
  try {
    const response = await api.post(
      "/api/language-contents/create",
      contentData
    );

    if (response.data && response.data.status === 1) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Create failed");
  } catch (error) {
    throw error;
  }
}

// Update language content
export async function updateLanguageContent(id, contentData) {
  try {
    const response = await api.put(
      `/api/language-contents/update/${id}`,
      contentData
    );

    if (response.data && response.data.status === 1) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Update failed");
  } catch (error) {
    throw error;
  }
}

// Delete language content
export async function deleteLanguageContent(id) {
  try {
    const response = await api.delete(`/api/language-contents/delete/${id}`);

    if (response.data && response.data.status === 1) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Delete failed");
  } catch (error) {
    throw error;
  }
}

// Get single language content by ID (admin endpoint)
export async function fetchLanguageContentById(id) {
  try {
    const response = await api.get(`/api/language-contents/find-by-id/${id}`);

    if (response.data && response.data.status === 1 && response.data.data) {
      return response.data.data;
    }

    throw new Error("Language content not found");
  } catch (error) {
    throw error;
  }
}

// Get single language content by ID using client endpoint
export async function fetchLanguageContentByIdClient(id) {
  try {
    const response = await api.get(`/api/language-contents/client/${id}`);

    if (response.data && response.data.status === 1 && response.data.result) {
      return response.data.result;
    }

    throw new Error("Language content not found");
  } catch (error) {
    throw error;
  }
}

// Load all translations for client use with caching
export async function loadAllTranslations() {
  try {
    // Check cache first
    const now = Date.now();
    if (
      translationsCache.data &&
      translationsCache.timestamp &&
      now - translationsCache.timestamp < translationsCache.expiry
    ) {
      return translationsCache.data;
    }

    // Use new client endpoint - loads all translations at once (no pagination)
    const response = await api.get("/api/language-contents/client/find-all");

    if (response.data && response.data.status === 1 && response.data.data) {
      const items = response.data.data.items || response.data.data || [];

      // Update cache
      translationsCache.data = items;
      translationsCache.timestamp = now;

      return items;
    }

    throw new Error("Invalid response format from client API");
  } catch (error) {
    console.error('[loadAllTranslations] Error:', error);
    // Return cached data if available, even if expired
    if (translationsCache.data) {
      return translationsCache.data;
    }
    return [];
  }
}

// Get single translation by key
export async function getTranslationByKey(key) {
  try {
    const translations = await loadAllTranslations();
    return translations.find((t) => t.contentKey === key);
  } catch (error) {
    return null;
  }
}

// Clear translations cache (call when admin updates translations)
export function clearTranslationsCache() {
  translationsCache.data = null;
  translationsCache.timestamp = null;

  // Also clear localStorage cache for i18n
  try {
    localStorage.removeItem("i18nextLng");
    ["vi", "en"].forEach((lang) => {
      localStorage.removeItem(`i18n_${lang}_timestamp`);
      localStorage.removeItem(`i18n_${lang}_data`); // Clear translations data
    });

    // Clear any other i18n related cache
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("i18next") || key.startsWith("i18n_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {}
}

// Get translations for i18next (export format) using client endpoint with caching
export async function fetchTranslationsForI18next(language = "vi") {
  try {
    // Use cached loading function
    const items = await loadAllTranslations();
    let allTranslations = {};

    // Convert to nested object format for i18next
    items.forEach((item) => {
      const value = language === "vi" ? item.valueVi : item.valueEn;
      if (value) {
        // Handle nested keys like "auth.login" -> { auth: { login: "value" } }
        const keys = item.contentKey.split(".");
        let current = allTranslations;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
      }
    });

    return allTranslations;
  } catch (error) {
    console.error('[fetchTranslationsForI18next] Error:', error);
    // Return empty object on error to prevent i18next from breaking
    return {};
  }
}

// Get language content statistics
export async function fetchLanguageContentStats() {
  try {
    const response = await api.get("/api/language-contents/stats");

    if (response.data && response.data.status === 1) {
      return response.data.data;
    }

    return {
      total: 0,
      byCategory: {},
      completionRate: { vi: 0, en: 0 },
    };
  } catch (error) {
    return {
      total: 0,
      byCategory: {},
      completionRate: { vi: 0, en: 0 },
    };
  }
}
