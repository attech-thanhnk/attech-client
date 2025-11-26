import api from "../api";
import { register } from "./authService";
import { useState, useEffect } from "react";

/**
 * User Service - Quản lý tương tác với User API
 * Base URL: Uses centralized API configuration
 */

// ==================== CRUD Operations ====================

/**
 * Fetch users with filters (similar to fetchNews pattern)
 * @param {number} pageNumber - Current page number
 * @param {number} pageSize - Items per page  
 * @param {string} keyword - Search keyword
 * @param {Object} filters - Filter object
 * @param {Object} sortConfig - Sort configuration
 * @returns {Promise<Object>} Users data with pagination
 */
export const fetchUsers = async (pageNumber = 1, pageSize = 10, keyword = "", filters = {}, sortConfig = null) => {
  try {
    const params = {
      pageNumber,
      pageSize,
      keyword
    };

    // Add filters if provided (following NewsList pattern + roleId)
    if (filters.role) {
      params.roleId = parseInt(filters.role, 10);
    }
    if (filters.status) {
      params.status = filters.status === "active" ? 1 : 0;
    }

    // Add sorting if provided
    if (sortConfig?.key) {
      params.sortBy = sortConfig.key;
      params.sortDirection = sortConfig.direction;
    }

    const response = await api.get("/api/user", { params });
    
    if (response.data && response.data.status === 1 && response.data.data) {
      const totalItems = response.data.data.totalItems || response.data.data.total || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        items: response.data.data.items || [],
        totalItems: totalItems,
        totalPages: totalPages
      };
    }
    
    throw new Error("Invalid users response");
  } catch (error) {throw error;
  }
};

/**
 * Lấy danh sách Users với pagination và search
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.size - Số items per page (default: 10)
 * @param {string} params.keyword - Tìm kiếm theo username/fullname
 * @returns {Promise<Object>} Response data
 */
export const getUsers = async (params = {}) => {
  try {
    // Map parameters to match backend PagingRequestBaseDto
    const apiParams = {
      pageNumber: params.page || params.pageIndex || 1,
      pageSize: params.size || params.pageSize || 10,
      keyword: params.keyword || params.search || params.searchTerm || ''
    };
    
    // Add filters if provided
    if (params.roleId) {
      apiParams.roleId = parseInt(params.roleId);
    }
    
    if (params.status) {
      // Convert string status to int: "active" -> 1, "inactive" -> 0
      apiParams.status = params.status === 'active' ? 1 : 0;
    }
    
    // Remove empty/undefined parameters
    Object.keys(apiParams).forEach(key => {
      if (apiParams[key] === '' || apiParams[key] === undefined || apiParams[key] === null) {
        delete apiParams[key];
      }
    });
    
    const response = await api.get("/api/user", { params: apiParams });
    return response.data;
  } catch (error) {throw error;
  }
};

/**
 * Lấy thông tin User theo ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} Response data
 */
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/api/user/${id}`);
    return response.data;
  } catch (error) {throw error;
  }
};

/**
 * Tạo User mới (Admin) - sử dụng /api/auth/register
 * @param {Object} userData - User data theo CreateUserDto
 * @param {string} userData.username - Tên đăng nhập (max 50 chars)
 * @param {string} userData.password - Mật khẩu (min 6 chars)
 * @param {string} userData.fullName - Tên đầy đủ (max 100 chars)
 * @param {string} userData.email - Email (required, email format, max 100 chars)
 * @param {string} userData.phone - Số điện thoại (optional, max 20 chars)
 * @param {number} userData.roleId - Role ID: 1=SuperAdmin, 2=Admin, 3=Editor (default: 3)
 * @param {number} userData.status - Trạng thái: 1=active, 0=inactive (default: 1)
 * @returns {Promise<Object>} Response data
 */
export const createUser = async (userData) => {
  try {
    // Map user data to match backend CreateUserDto format
    const createUserDto = {
      username: userData.username,
      password: userData.password,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone || null,
      roleId: userData.roleId || 3,
      status: userData.status !== undefined ? userData.status : 1
    };
    
    const result = await register(createUserDto);
    
    if (result.success) {
      return {
        Status: 1,
        Data: result.data,
        Message: result.message
      };
    } else {
      return {
        Status: 0,
        Message: result.message
      };
    }
  } catch (error) {throw error;
  }
};

/**
 * Map user data properties to match backend DTO format
 * @param {Object} userData - User data with camelCase or PascalCase properties
 * @returns {Object} Mapped user data for backend
 */
const mapUserDataForBackend = (userData) => {
  const mapped = {
    Id: userData.Id || userData.id,
    Username: userData.Username || userData.username,
    FullName: userData.FullName || userData.fullName,
    Email: userData.Email || userData.email || null,
    Phone: userData.Phone || userData.phone || null,
    UserType: userData.UserType || userData.userType,
    Status: userData.Status || userData.status,
    RoleIds: userData.RoleIds || userData.roleIds || []
  };
  
  // Include password if provided (for registration)
  if (userData.password || userData.Password) {
    mapped.Password = userData.Password || userData.password;
  }
  
  return mapped;
};

/**
 * Cập nhật User - sử dụng PUT /api/user
 * @param {Object} userData - User data theo UpdateUserDto
 * @param {number} userData.id - User ID
 * @param {string} userData.username - Tên đăng nhập (max 50 chars)
 * @param {string} userData.fullName - Tên đầy đủ (max 100 chars, optional)
 * @param {string} userData.email - Email (max 100 chars, optional)
 * @param {string} userData.phone - Số điện thoại (max 20 chars, optional)
 * @param {number} userData.roleId - Role ID: 1=SuperAdmin, 2=Admin, 3=Editor
 * @param {number} userData.status - Trạng thái: 1=active, 0=inactive
 * @returns {Promise<Object>} Response data
 */
export const updateUser = async (userData) => {
  try {
    // Map user data to match backend UpdateUserDto format
    const updateUserDto = {
      id: userData.id,
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email || null,
      phone: userData.phone || null,
      roleId: userData.roleId,
      status: userData.status
    };
    
    const response = await api.put("/api/user", updateUserDto);
    return response.data;
  } catch (error) {throw error;
  }
};

/**
 * Xóa User
 * @param {number} id - User ID
 * @returns {Promise<Object>} Response data
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/user/${id}`);
    return response.data;
  } catch (error) {throw error;
  }
};

/**
 * Reset mật khẩu User (Admin only)
 * @param {number} userId - User ID
 * @param {string} newPassword - Mật khẩu mới (min 6 chars)
 * @returns {Promise<Object>} Response data
 */
export const resetPassword = async (userId, newPassword) => {
  try {
    const response = await api.put(`/api/user/${userId}/reset-password`, {
      newPassword: newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== Role Management ====================

/**
 * Thêm Role cho User
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Response data
 */
export const addRoleToUser = async (userId, roleId) => {
  try {
    const response = await api.post(`/api/user/${userId}/roles/${roleId}`);
    return response.data;
  } catch (error) {throw error;
  }
};

/**
 * Xóa Role của User
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Response data
 */
export const removeRoleFromUser = async (userId, roleId) => {
  try {
    const response = await api.delete(`/api/user/${userId}/roles/${roleId}`);
    return response.data;
  } catch (error) {throw error;
  }
};

// ==================== Utility Functions ====================

/**
 * Validate user data before create/update
 * @param {Object} userData - User data to validate
 * @param {boolean} isCreate - Whether this is for create operation
 * @returns {Object} Validation result { isValid: boolean, errors: Array }
 */
export const validateUserData = (userData, isCreate = false) => {
  const errors = [];

  // Required fields for create
  if (isCreate) {
    if (!userData.username || userData.username.trim().length === 0) {
      errors.push('Username là bắt buộc');
    } else if (userData.username.length > 50) {
      errors.push('Username không được vượt quá 50 ký tự');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
  }

  // Common validations
  if (!userData.fullName || userData.fullName.trim().length === 0) {
    errors.push('Tên đầy đủ là bắt buộc');
  } else if (userData.fullName.length > 100) {
    errors.push('Tên đầy đủ không được vượt quá 100 ký tự');
  }

  if (userData.email && userData.email.length > 100) {
    errors.push('Email không được vượt quá 100 ký tự');
  }

  if (userData.phone && userData.phone.length > 20) {
    errors.push('Số điện thoại không được vượt quá 20 ký tự');
  }

  if (userData.userType === undefined || userData.userType === null) {
    errors.push('Loại user là bắt buộc');
  } else if (![1, 2, 3].includes(userData.userType)) {
    errors.push('Loại user không hợp lệ');
  }

  if (userData.status === undefined || userData.status === null) {
    errors.push('Trạng thái là bắt buộc');
  } else if (![0, 1].includes(userData.status)) {
    errors.push('Trạng thái không hợp lệ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Map roleId number to display text
 * @param {number} roleId - Role ID number
 * @returns {string} Display text
 */
export const getRoleText = (roleId) => {
  const roles = {
    1: 'SuperAdmin',
    2: 'Admin',
    3: 'Editor'
  };
  return roles[roleId] || 'Unknown';
};

/**
 * Map status number to display text
 * @param {number} status - Status number
 * @returns {string} Display text
 */
export const getStatusText = (status) => {
  return status === 1 ? 'Active' : 'Inactive';
};

/**
 * Map userLevel to display text
 * @param {string} userLevel - User level from API
 * @returns {string} Display text
 */
export const getUserLevelText = (userLevel) => {
  const userLevels = {
    'system': 'System Administrator',
    'manager': 'Manager/Admin',
    'staff': 'Staff/Editor'
  };
  return userLevels[userLevel] || 'Unknown';
};

// ==================== React Hook Helper ====================

/**
 * Custom hook for managing users with pagination and search
 * @returns {Object} Hook state and methods
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0
  });

  const fetchUsers = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUsers({ page, pageSize, search });
      
      // Handle camelCase API format only
      if (response.status === 1) {
        const dataObj = response.data;
        setUsers(dataObj.items || []);
        setPagination({
          page,
          pageSize,
          totalItems: dataObj.totalItems || 0
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  const createUserHandler = async (userData) => {
    try {
      const response = await createUser(userData);
      
      // Handle camelCase API format only
      if (response.status === 1) {
        // Refresh users list
        await fetchUsers(pagination.page, pagination.pageSize);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const updateUserHandler = async (userData) => {
    try {
      const response = await updateUser(userData);
      
      // Handle camelCase API format only
      if (response.status === 1) {
        // Refresh users list
        await fetchUsers(pagination.page, pagination.pageSize);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const deleteUserHandler = async (id) => {
    try {
      const response = await deleteUser(id);
      
      // Handle camelCase API format only
      if (response.status === 1) {
        // Refresh users list
        await fetchUsers(pagination.page, pagination.pageSize);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser: createUserHandler,
    updateUser: updateUserHandler,
    deleteUser: deleteUserHandler
  };
};

// Export all functions
export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  addRoleToUser,
  removeRoleFromUser,
  validateUserData,
  getRoleText,
  getStatusText,
  getUserLevelText,
  useUsers
}; 