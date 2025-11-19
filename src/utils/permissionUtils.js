/**
 * Permission Utilities for Frontend - Simple roleId system
 * Using roleId for permission checking
 */

import { ROLES } from '../contexts/AuthContext';

// Re-export ROLES for backward compatibility
export { ROLES };

/**
 * Check if user has required permission level
 * @param {Object} user - Current user object
 * @param {number} requiredRoleId - Required roleId (1-3)
 * @returns {boolean}
 */
export const hasPermission = (user, requiredRoleId) => {
  if (!user || typeof requiredRoleId !== 'number') return false;
  return user.roleId <= requiredRoleId;
};

// Helper functions using simple roleId system

/**
 * Check if user can manage users (Admin level required)
 */
export const canManageUsers = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Check if user can create users (Admin level required)
 */
export const canCreateUser = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Check if user can view users (Admin level required)
 */
export const canViewUsers = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Check if user can edit users (Admin level required)
 */
export const canEditUser = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Check if user can delete users (Admin level required)
 */
export const canDeleteUser = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Check if user can manage roles (Admin level required)
 */
export const canManageRoles = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Check if user can edit content (Editor level required)
 */
export const canEditContent = (user) => hasPermission(user, ROLES.EDITOR);

/**
 * Check if user can access admin panel (Editor level required)
 */
export const canAccessAdmin = (user) => hasPermission(user, ROLES.EDITOR);

/**
 * Check if user can upload files (Editor level required)
 */
export const canUploadFiles = (user) => hasPermission(user, ROLES.EDITOR);

/**
 * Check if user can access system settings (Admin and SuperAdmin)
 */
export const canAccessSystem = (user) => hasPermission(user, ROLES.ADMIN);

/**
 * Get user role display name
 */
export const getRoleDisplayName = (user) => {
  if (!user || !user.roleId) return 'Unknown';
  return getRoleName(user.roleId);
};

/**
 * Get role name for display
 */
export const getRoleName = (roleId) => {
  switch (roleId) {
    case ROLES.SUPERADMIN:
      return 'Super Admin';
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.EDITOR:
      return 'Editor';
    default:
      return 'Unknown';
  }
};