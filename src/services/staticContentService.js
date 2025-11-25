import api from '../api';
import {
  getTranslationByKey,
  loadAllTranslations,
  updateLanguageContent,
  createLanguageContent
} from './languageContentService';

/**
 * Static Content Service
 * Manages static pages content through Language Content system
 */

const staticContentService = {
  /**
   * Get content for a translation key
   * @param {string} translationKey - e.g., "frontend.companyInfo.business.fullContent"
   * @returns {Promise<{vi: string, en: string}>}
   */
  getContent: async (translationKey) => {
    try {
      console.log('[staticContentService.getContent] Looking for key:', translationKey);
      // Use existing languageContentService to find by key
      const translation = await getTranslationByKey(translationKey);
      console.log('[staticContentService.getContent] Found translation:', translation);

      if (translation) {
        const result = {
          vi: translation.valueVi || '',
          en: translation.valueEn || ''
        };
        console.log('[staticContentService.getContent] Returning:', result);
        return result;
      }

      // If key doesn't exist yet, return empty strings
      console.log('[staticContentService.getContent] Key not found, returning empty');
      return { vi: '', en: '' };
    } catch (error) {
      console.error('[staticContentService.getContent] Error:', error);
      return { vi: '', en: '' };
    }
  },

  /**
   * Update content for a translation key
   * @param {string} translationKey
   * @param {{vi: string, en: string}} content
   * @returns {Promise<void>}
   */
  updateContent: async (translationKey, content) => {
    try {
      // Find existing translation
      const translation = await getTranslationByKey(translationKey);

      if (translation) {
        // Update existing
        await updateLanguageContent(translation.id, {
          contentKey: translationKey,
          valueVi: content.vi || '',
          valueEn: content.en || '',
          category: translation.category || 'frontend',
          description: translation.description || ''
        });
      } else {
        // Create new
        await createLanguageContent({
          contentKey: translationKey,
          valueVi: content.vi || '',
          valueEn: content.en || '',
          category: 'frontend',
          description: `Static content for ${translationKey}`
        });
      }

      return {
        success: true,
        message: 'Cập nhật nội dung thành công'
      };
    } catch (error) {
      console.error('Error updating static content:', error);
      throw new Error(error.response?.data?.message || 'Lỗi cập nhật nội dung');
    }
  },

  /**
   * Get all static pages configuration
   * This is client-side only - the list of pages is defined in the component
   */
  getPages: () => {
    return [
      {
        id: "business",
        titleVi: "Ngành nghề kinh doanh",
        titleEn: "Business Fields",
        translationKey: "frontend.companyInfo.business.fullContent",
        description: "Thông tin về các ngành nghề kinh doanh của công ty",
        route: "/thong-tin-cong-ty/nganh-nghe-kinh-doanh",
      },
      // Add more pages here as needed
    ];
  }
};

export default staticContentService;
