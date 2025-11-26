import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {
  fetchTranslationsForI18next,
  clearTranslationsCache,
} from "../services/languageContentService";

// Import fallback language resources (in case API fails)
import viTranslation from "./locales/vi.json";
import enTranslation from "./locales/en.json";

// API Backend để load translations từ database
class ApiBackend {
  constructor(services, options = {}) {
    this.init(services, options);
  }

  init(services, options = {}) {
    this.services = services;
    this.options = options;
  }

  read(language, namespace, callback) {
    // Always use fallback first to prevent showing keys
    const fallback = language === "vi" ? viTranslation : enTranslation;

    // Try to get cached translations from localStorage
    const cacheKey = `i18n_${language}_data`;
    const timestampKey = `i18n_${language}_timestamp`;
    let cachedTranslations = null;

    try {
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(timestampKey);

      // Use cache if it exists and is less than 1 hour old
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < 3600000) { // 1 hour
          cachedTranslations = JSON.parse(cached);
        }
      }
    } catch (error) {
    }

    // Deep merge cached translations with fallback
    // Use a simple deep merge to preserve nested objects
    const deepMerge = (target, source) => {
      const output = { ...target };
      if (source) {
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            output[key] = deepMerge(target[key] || {}, source[key]);
          } else {
            output[key] = source[key];
          }
        });
      }
      return output;
    };

    const initialData = cachedTranslations
      ? deepMerge(fallback, cachedTranslations)
      : fallback;

    // Return initial data (fallback + cache if available)
    callback(null, initialData);

    // Then fetch from API to update in background
    // Load translations for all users, not just authenticated ones
    fetchTranslationsForI18next(language)
      .then((translations) => {
        // Only update if we actually got translations
        if (translations && Object.keys(translations).length > 0) {
          // Store translations and timestamp in localStorage
          try {
            localStorage.setItem(cacheKey, JSON.stringify(translations));
            localStorage.setItem(timestampKey, Date.now().toString());
          } catch (error) {
          }

          // Update translations in i18n - deep merge is true, overwrite is true
          i18n.addResourceBundle(
            language,
            namespace,
            translations,
            true,  // deep merge
            true   // overwrite existing keys
          );

          // Force emit events to trigger component re-render
          // This ensures ALL components using useTranslation will update
          i18n.emit('languageChanged', language);
          i18n.emit('loaded', { [language]: { [namespace]: translations } });
        }
      })
      .catch((error) => {
      });
  }
}

// Register the backend
ApiBackend.type = "backend";

const resources = {
  vi: {
    translation: viTranslation, // Fallback
  },
  en: {
    translation: enTranslation, // Fallback
  },
};

// Initialize i18n with backend
i18n
  // Use API backend to load translations
  .use(ApiBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // DON'T include resources here - let backend load them
    // This forces i18next to call our ApiBackend

    // Default language
    lng: "vi", // Vietnamese as default
    fallbackLng: "vi",

    // Supported languages
    supportedLngs: ["vi", "en"],

    // Backend options
    backend: {
      // Backend will use our ApiBackend class
      loadPath: "/api/language-contents/{{lng}}/{{ns}}", // Template for backend
    },

    // Language detection options
    detection: {
      // Order of language detection methods
      order: ["localStorage", "navigator", "htmlTag"],

      // Cache user language
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Development options
    debug: false, // Disable debug để tránh spam logs

    // Namespace configuration
    defaultNS: "translation",
    ns: ["translation"],

    // IMPORTANT: Set to false to force backend loading
    initImmediate: false,

    // Partialness - allow fallback and backend to work together
    partialBundledLanguages: true,
  });

// Function to reload translations from API (call after admin changes)
export const reloadTranslations = async (language = null) => {
  try {
    // Clear cache to force fresh data load
    clearTranslationsCache();

    const currentLang = language || i18n.language;

    // Clear localStorage cache (both timestamp and data)
    localStorage.removeItem(`i18n_${currentLang}_timestamp`);
    localStorage.removeItem(`i18n_${currentLang}_data`);

    const translations = await fetchTranslationsForI18next(currentLang);

    // Update localStorage with new translations
    if (translations && Object.keys(translations).length > 0) {
      localStorage.setItem(`i18n_${currentLang}_data`, JSON.stringify(translations));
      localStorage.setItem(`i18n_${currentLang}_timestamp`, Date.now().toString());
    }

    // Update i18n with new translations
    i18n.addResourceBundle(
      currentLang,
      "translation",
      translations,
      true,
      true
    );

    return true;
  } catch (error) {
    return false;
  }
};

// Function to check if translations need refresh based on admin updates
export const checkTranslationsVersion = async () => {
  try {
    const currentLang = i18n.language || "vi";
    const lastUpdate = localStorage.getItem(`i18n_${currentLang}_timestamp`);

    // Force clear if there's stale data or missing timestamp
    const isStale = !lastUpdate || Date.now() - parseInt(lastUpdate) > 3600000;

    if (isStale) {
      // Force clear all i18n cache
      clearTranslationsCache();
      await reloadTranslations();
    }
  } catch (error) {}
};

// Force clear function for immediate use
export const forceReloadTranslations = async () => {
  try {
    // Clear everything
    clearTranslationsCache();

    // Reload both languages
    await Promise.all([reloadTranslations("vi"), reloadTranslations("en")]);

    // Force page reload to ensure clean state
    window.location.reload();
  } catch (error) {
    // Fallback: just reload the page
    window.location.reload();
  }
};

// Function to clear translations cache (for admin use)
export const clearTranslationCache = clearTranslationsCache;

export default i18n;

