/**
 * Hierarchy Utilities for User Management - Simple roleId system
 */

import { ROLES } from '../contexts/AuthContext';

/**
 * Check what actions current user can perform on target user
 * @param {Object} currentUser - Current logged in user
 * @param {Object} targetUser - User being acted upon
 * @returns {Object} Object with roleId-based flags
 */
export const canModifyUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) {
    return {
      canEdit: false,
      canDelete: false,
      canChangeRoles: false,
      canPromote: false,
      canViewDetails: false
    };
  }

  const currentRoleId = currentUser.roleId || ROLES.EDITOR;
  const targetRoleId = targetUser.roleId || ROLES.EDITOR;

  // Can only modify users at higher roleId (lower permission)
  const canModify = currentRoleId < targetRoleId;
  
  // Admin level can manage Editor and below
  const canManage = currentRoleId <= ROLES.ADMIN;

  return {
    canEdit: canModify && canManage,
    canDelete: canModify && currentRoleId <= ROLES.ADMIN,
    canChangeRoles: canModify && currentRoleId <= ROLES.ADMIN,
    canPromote: canModify && currentRoleId <= ROLES.ADMIN, // Admin and SuperAdmin can promote
    canViewDetails: currentRoleId <= ROLES.ADMIN
  };
};

/**
 * Get role name for display
 * @param {number} roleId - Role ID (1-4)
 * @returns {string} Display name
 */
export const getRoleName = (roleId) => {
  switch (roleId) {
    case ROLES.SUPERADMIN:
      return 'Super Admin';
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.EDITOR:
      return 'Editor';
    case ROLES.USER:
      return 'User';
    default:
      return 'Unknown';
  }
};

/**
 * Check if user can access admin features
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canAccessAdmin = (user) => {
  return user && user.roleId <= ROLES.EDITOR;
};


export { ROLES };