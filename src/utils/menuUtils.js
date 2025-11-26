/**
 * Menu utilities for working with flat array format from /api/menu/frontend
 */

/**
 * Get menu items by level
 * @param {Array} menuData - Flat menu array
 * @param {number} level - Menu level (0, 1, 2...)
 * @returns {Array} Menu items at specified level
 */
export const getMenusByLevel = (menuData, level) => {
  return menuData
    .filter((item) => item.level === level && item.isActive)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get children of a menu item
 * @param {Array} menuData - Flat menu array
 * @param {number} parentId - Parent menu ID
 * @returns {Array} Child menu items
 */
export const getMenuChildren = (menuData, parentId) => {
  return menuData
    .filter((item) => item.parentId === parentId && item.isActive)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get root menu items (level 0)
 * @param {Array} menuData - Flat menu array
 * @returns {Array} Root menu items
 */
export const getRootMenus = (menuData) => {
  return getMenusByLevel(menuData, 0);
};

/**
 * Get label based on current language
 * @param {Object} menuItem - Menu item object
 * @param {string} language - Current language ('vi' or 'en')
 * @returns {string} Menu label
 */
export const getMenuLabel = (menuItem, language = "vi") => {
  // Support both titleVi/titleEn and labelVi/labelEn formats
  return language === "en" ? menuItem.titleEn : menuItem.titleVi;
};

/**
 * Get path based on current language
 * @param {Object} menuItem - Menu item object
 * @param {string} language - Current language ('vi' or 'en')
 * @returns {string} Menu path
 */
export const getMenuPath = (menuItem, language = "vi") => {
  // Support both url/urlEn and pathVi/pathEn formats
  const basePath = language === "en" ? menuItem.urlEn : menuItem.url;

  // Add .html only for actual detail/item pages, not category pages
  if (menuItem.menuType === "item") {
    // Check if it's a detail item that needs .html (both Vietnamese and English)
    const needsHtml = [
      "/san-pham/",
      "/dich-vu/",
      "/tin-tuc/",
      "/thong-bao/",
      "/en/products/",
      "/en/services/",
      "/en/news/",
      "/en/notifications/",
    ].some((prefix) => basePath.startsWith(prefix));

    if (needsHtml && !basePath.endsWith(".html")) {
      return basePath + ".html";
    }
  }

  return basePath;
};

/**
 * Build hierarchical menu structure from flat array
 * @param {Array} menuData - Flat menu array
 * @returns {Array} Hierarchical menu structure
 */
export const buildMenuTree = (menuData) => {
  const menuMap = {};
  const result = [];

  // Create map for quick lookup
  menuData.forEach((item) => {
    menuMap[item.id] = { ...item, children: [] };
  });

  // Build tree structure
  menuData.forEach((item) => {
    const menuItem = menuMap[item.id];

    if (item.parentId && menuMap[item.parentId]) {
      menuMap[item.parentId].children.push(menuItem);
    } else {
      result.push(menuItem);
    }
  });

  // Sort by order at each level
  const sortByOrder = (items) => {
    items.sort((a, b) => a.order - b.order);
    items.forEach((item) => {
      if (item.children.length > 0) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(result);
  return result;
};

/**
 * Find menu item by key
 * @param {Array} menuData - Flat menu array
 * @param {string} key - Menu key
 * @returns {Object|null} Menu item or null if not found
 */
export const findMenuByKey = (menuData, key) => {
  return menuData.find((item) => item.key === key) || null;
};

/**
 * Check if menu has children
 * @param {Array} menuData - Flat menu array
 * @param {number} menuId - Menu ID
 * @returns {boolean} True if menu has children
 */
export const hasChildren = (menuData, menuId) => {
  return menuData.some((item) => item.parentId === menuId && item.isActive);
};

/**
 * Get breadcrumb path for a menu item
 * @param {Array} menuData - Flat menu array
 * @param {number} menuId - Menu ID
 * @param {string} language - Current language
 * @returns {Array} Breadcrumb array
 */
export const getMenuBreadcrumb = (menuData, menuId, language = "vi") => {
  const breadcrumb = [];
  const menuMap = {};

  menuData.forEach((item) => {
    menuMap[item.id] = item;
  });

  let currentItem = menuMap[menuId];

  while (currentItem) {
    breadcrumb.unshift({
      id: currentItem.id,
      label: getMenuLabel(currentItem, language),
      path: getMenuPath(currentItem, language),
      key: currentItem.key,
    });

    currentItem = currentItem.parentId ? menuMap[currentItem.parentId] : null;
  }

  return breadcrumb;
};