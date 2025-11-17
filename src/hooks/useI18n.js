import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  getLocalizedContent,
  getLocalizedTitle,
  getLocalizedDescription,
  getLocalizedName,
  getLocalizedContentText,
  getLocalizedSummary,
  formatLocalizedDate,
  getCategoryName,
  truncateText,
  getLocalizedSlug
} from '../utils/i18nHelpers';

/**
 * Enhanced i18n hook with localized content helpers
 * Automatically re-renders when translations are loaded from API
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const [, forceUpdate] = useState(0);

  // Force re-render when translations are updated from API
  useEffect(() => {
    const handleLanguageChanged = () => {
      forceUpdate(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  const currentLanguage = i18n.language || 'vi';
  const isVietnamese = currentLanguage === 'vi';
  const isEnglish = currentLanguage === 'en';
  
  return {
    // Standard react-i18next functions
    t,
    i18n,
    
    // Language info
    currentLanguage,
    isVietnamese,
    isEnglish,
    
    // Localized content helpers
    getLocalizedContent,
    getLocalizedTitle,
    getLocalizedDescription,
    getLocalizedName,
    getLocalizedContentText,
    getLocalizedSummary,
    getLocalizedSlug,
    
    // Formatting helpers
    formatLocalizedDate,
    getCategoryName,
    truncateText,
    
    // Shorthand helpers for common patterns
    content: getLocalizedContent,
    title: getLocalizedTitle,
    description: getLocalizedDescription,
    name: getLocalizedName,
    summary: getLocalizedSummary,
    slug: getLocalizedSlug,
    
    // Language switching - Force full page reload to home page
    changeLanguage: (lng, skipRedirect = false) => {
      i18n.changeLanguage(lng);
      
      // Only redirect if explicitly requested (e.g., from language switcher)
      if (!skipRedirect) {
        // Force full page reload to home page in the target language
        const homeUrl = lng === 'en' ? '/en' : '/';
        window.location.replace(homeUrl); // Use replace() to force full reload
      }
    },
    
    // Common translations shortcuts
    loading: () => t('common.loading'),
    error: () => t('common.error'),
    success: () => t('common.success'),
    save: () => t('common.save'),
    cancel: () => t('common.cancel'),
    edit: () => t('common.edit'),
    delete: () => t('common.delete'),
    add: () => t('common.add'),
    search: () => t('common.search'),
    
    // Status translations
    active: () => t('admin.news.status.active'),
    inactive: () => t('admin.news.status.inactive')
  };
};

export default useI18n;