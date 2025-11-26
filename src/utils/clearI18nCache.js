/**
 * Utility to clear i18n cache and force reload translations from API
 * Usage: Import and call clearI18nCache() when needed
 */

export const clearI18nCache = () => {

  // Clear all i18n related localStorage items
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('i18n_') || key.startsWith('i18next'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });


  return keysToRemove.length;
};

/**
 * Check current cache status
 */
export const checkI18nCache = () => {

  const cacheInfo = {
    vi: {},
    en: {}
  };

  ['vi', 'en'].forEach(lang => {
    const dataKey = `i18n_${lang}_data`;
    const timestampKey = `i18n_${lang}_timestamp`;

    const data = localStorage.getItem(dataKey);
    const timestamp = localStorage.getItem(timestampKey);

    if (data && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      const ageMinutes = Math.round(age / 60000);

      try {
        const parsed = JSON.parse(data);
        cacheInfo[lang] = {
          exists: true,
          age: `${ageMinutes} minutes`,
          timestamp: new Date(parseInt(timestamp)).toISOString(),
          footerAddress: parsed?.footer?.address || 'Not found',
          keys: Object.keys(parsed).length
        };
      } catch (e) {
        cacheInfo[lang] = {
          exists: true,
          error: 'Failed to parse cache data'
        };
      }
    } else {
      cacheInfo[lang] = {
        exists: false
      };
    }
  });

  return cacheInfo;
};

/**
 * Force reload translations from API
 */
export const forceReloadTranslations = async () => {

  // Clear cache first
  clearI18nCache();

  // Reload page to trigger fresh API call
  window.location.reload();
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  window.clearI18nCache = clearI18nCache;
  window.checkI18nCache = checkI18nCache;
  window.forceReloadTranslations = forceReloadTranslations;
}
