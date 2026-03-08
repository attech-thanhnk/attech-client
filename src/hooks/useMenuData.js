import { useState, useEffect, useCallback } from 'react';
import { getMenuHierarchy } from '../services/menuService';
import { buildMenuTree, getRootMenus, getMenuChildren } from '../utils/menuUtils';

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

const getMenuCache = (language) => {
  try {
    const cached = JSON.parse(localStorage.getItem(`menu_cache_${language} `));
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  } catch { }
  return null;
};

const setMenuCache = (language, data) => {
  try {
    localStorage.setItem(`menu_cache_${language} `, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { }
};

const useMenuData = (language = 'vi') => {
  const cachedData = getMenuCache(language);
  const [rawMenuData, setRawMenuData] = useState(cachedData || []); // Flat array from API
  const [menuData, setMenuData] = useState(() => cachedData ? buildMenuTree(cachedData) : []); // Processed data for compatibility
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  const fetchMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMenuHierarchy(language);

      if (Array.isArray(data)) {
        setMenuCache(language, data); // Lưu cache để lần sau render ngay
        setRawMenuData(data);
        // Build hierarchical structure for backward compatibility
        const hierarchicalData = buildMenuTree(data);
        setMenuData(hierarchicalData);
      } else {
        setRawMenuData([]);
        setMenuData([]);
      }
    } catch (err) {
      setError(err.message);
      setRawMenuData([]);
      setMenuData([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  const refetch = useCallback(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  return {
    menuData, // Hierarchical structure for compatibility
    rawMenuData, // Flat array for new implementations
    loading,
    error,
    refetch,
    // Utility methods for flat array
    getRootMenus: useCallback(() => getRootMenus(rawMenuData), [rawMenuData]),
    getMenuChildren: useCallback((parentId) => getMenuChildren(rawMenuData, parentId), [rawMenuData])
  };
};

export default useMenuData;