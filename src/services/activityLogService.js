import api from '../api';

/**
 * Lấy danh sách activity log gần nhất
 * @param {number} limit - Số lượng log muốn lấy
 * @returns {Promise<Object>} Response data
 */
export const getRecentActivityLogs = async (limit = 50) => {
  try {
    const response = await api.get(`/api/activity-log/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách activity log theo loại
 * @param {string} type - Loại log (user_login, security_login_failed, security_captcha_failed)
 * @param {number} limit - Số lượng log muốn lấy
 * @returns {Promise<Object>} Response data
 */
export const getActivityLogsByType = async (type, limit = 50) => {
  try {
    const response = await api.get(`/api/activity-log/by-type/${type}?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getRecentActivityLogs,
  getActivityLogsByType
};
