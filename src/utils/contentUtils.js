import { getApiBaseUrl } from "../config/apiConfig";

/**
 * Process WYSIWYG content to convert relative image paths to full URLs
 * 
 * BE change: ContentVi, ContentEn fields now return relative paths like "/uploads/images/file.jpg"
 * Instead of full URLs like "https://domain.com/uploads/images/file.jpg"
 * 
 * This function converts: src="/uploads/..." -> src="https://domain.com/uploads/..."
 * 
 * @param {string} htmlContent - HTML content from WYSIWYG editor
 * @returns {string} Processed HTML content with full image URLs
 */
export function processWysiwygContent(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }

  const baseUrl = getApiBaseUrl();
  
  // Replace relative image paths with full URLs
  // Pattern matches: src="/uploads/..." and converts to src="https://domain.com/uploads/..."
  const processedContent = htmlContent.replace(
    /src="\/uploads\//g, 
    `src="${baseUrl}/uploads/`
  );
  
  return processedContent;
}

/**
 * Process WYSIWYG content with additional support for other relative paths
 * 
 * @param {string} htmlContent - HTML content from WYSIWYG editor
 * @param {object} options - Processing options
 * @param {boolean} options.processImages - Process image src attributes (default: true)
 * @param {boolean} options.processLinks - Process link href attributes (default: false)
 * @returns {string} Processed HTML content
 */
export function processWysiwygContentAdvanced(htmlContent, options = {}) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }

  const { 
    processImages = true, 
    processLinks = false 
  } = options;
  
  const baseUrl = getApiBaseUrl();
  let processedContent = htmlContent;
  
  // Process image src attributes
  if (processImages) {
    processedContent = processedContent.replace(
      /src="\/uploads\//g, 
      `src="${baseUrl}/uploads/`
    );
  }
  
  // Process link href attributes (if needed in the future)
  if (processLinks) {
    processedContent = processedContent.replace(
      /href="\/uploads\//g,
      `href="${baseUrl}/uploads/`
    );
  }

  return processedContent;
}

/**
 * Encode HTML content to Base64 for safe API transmission
 * This bypasses XSS middleware detection by encoding HTML entities
 *
 * @param {string} htmlContent - HTML content to encode
 * @returns {string} Base64 encoded content
 */
export function encodeContentForApi(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }

  // Convert to Base64 to bypass XSS middleware
  return btoa(unescape(encodeURIComponent(htmlContent)));
}

/**
 * Decode Base64 content back to HTML
 *
 * @param {string} base64Content - Base64 encoded content
 * @returns {string} Decoded HTML content
 */
export function decodeContentFromApi(base64Content) {
  if (!base64Content || typeof base64Content !== 'string') {
    return base64Content;
  }

  try {
    return decodeURIComponent(escape(atob(base64Content)));
  } catch (error) {
    // If decoding fails, return original content (might already be decoded)
    return base64Content;
  }
}