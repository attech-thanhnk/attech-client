import React, { useState, useEffect, useCallback } from "react";
import PageWrapper from "../components/PageWrapper";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import ToastMessage from "../components/ToastMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import AccessDenied from "../../components/AccessDenied";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addRoleToUser,
  removeRoleFromUser,
  validateUserData,
  getUserTypeText,
  getStatusText,
} from "../../services/userService";
import { getAllRoles } from "../../services/roleService";
import {
  hasPermission,
  canManageUsers,
  canCreateUser,
  canEditUser,
  canDeleteUser,
} from "../../utils/permissionUtils";
import {
  canModifyUser,
  getAssignableRoles,
} from "../../utils/hierarchyUtils";
import {
  getRoleColor,
  getRoleText,
  getRoleIcon,
  formatRole,
} from "../../utils/roleUtils";
import "./UserManagement.css";
import "./UserRoles.css";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    username: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    roleIds: [],
    roleNames: [], // Thêm roleNames
    userType: 2,
    status: 1,
    lastLogin: "",
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [filters, setFilters] = useState({
    search: "",
    userType: "",
    role: "",
    status: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Định nghĩa object emptyUser để dùng cho khởi tạo/reset form
  const emptyUser = {
    id: null,
    username: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    roleIds: [],
    roleNames: [], // Thêm roleNames
    userType: 2,
    status: 1,
    lastLogin: "",
    permissions: [],
  };

  // Helper function để map user data từ API
  const mapUserFromAPI = (user) => ({
    id: user.Id || user.id,
    username: user.Username || user.username,
    email: user.Email || user.email,
    fullName: user.FullName || user.fullName,
    phone: user.Phone || user.phone,
    roleIds: user.RoleIds || user.roleIds || [],
    roleNames: user.roleNames || [], // Sử dụng roleNames mới từ BE
    roles: user.roles || [], // Giữ roles array để backward compatibility
    userType:
      user.userLevel === "system" ? 1 : user.userLevel === "manager" ? 2 : 3, // Sử dụng userLevel từ API
    userLevel: user.userLevel, // Giữ nguyên userLevel từ API để dùng cho permission check
    status: user.status === "active" ? 1 : 0,
    lastLogin: user.lastLogin,
    roles: user.permissions || [], // permissions renamed to roles
  });

  // Helper function để map user data cho API
  const mapUserToAPI = (user) => {
    const userData = {
      username: user.username,
      email: user.email && user.email.trim() !== "" ? user.email.trim() : null,
      fullName: user.fullName,
      phone: user.phone && user.phone.trim() !== "" ? user.phone.trim() : null,
      userLevel: user.userType,
      status: user.status,
      roleIds: user.roleIds && user.roleIds.length > 0 ? user.roleIds : [],
    };

    // Chỉ thêm id nếu không phải tạo mới
    if (user.id !== null && user.id !== undefined) {
      userData.id = user.id;
    }

    // Thêm password nếu có (cho tạo mới)
    if (user.password && user.password.trim() !== "") {
      userData.password = user.password.trim();} else {}

    // Đảm bảo userLevel và status là number
    if (typeof userData.userLevel === "string") {
      userData.userLevel = parseInt(userData.userLevel);
    }
    if (typeof userData.status === "string") {
      userData.status = parseInt(userData.status);
    }

    // Log chi tiết userLevel để debug// Đảm bảo roleIds là array of numbers
    if (userData.roleIds && Array.isArray(userData.roleIds)) {
      userData.roleIds = userData.roleIds.map((id) =>
        typeof id === "string" ? parseInt(id) : id
      );
    }

    // Debug removed to prevent React rendering issues

    return userData;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesData, usersData] = await Promise.all([
          getAllRoles(),
          getUsers({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            searchTerm: filters.search,
          }),
        ]);
        if (rolesData?.data?.items) {
          const rolesArray = rolesData.data.items || [];
          const activeRoles = rolesArray.filter((role) => role.status === 1);
          setRoles(activeRoles);
        } else {
          setRoles([]);
        }

        // Xử lý users data từ API response structure theo BE
        if (usersData?.status === 1) {
          const usersFromAPI = usersData.data?.items || [];
          const mappedUsers = usersFromAPI.map(mapUserFromAPI);setUsers(mappedUsers);
        } else {
          setUsers([]);
        }
      } catch (error) {
        setRoles([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, filters.search]);

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedUser({ ...emptyUser });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setErrors({});
    setShowModal(true);
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await getUserById(userId);

      if (response?.status === 1) {
        const userDetails = mapUserFromAPI(response.data);
        setSelectedUser(userDetails);
        setEditMode(false);
        setErrors({});
        setShowModal(true);
      } else {
        setToast({
          show: true,
          message: response?.message || "Không thể tải thông tin user!",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Lỗi khi tải thông tin user!",
        type: "error",
      });
    }
  };

  const handleAddRoleToUser = async (userId, roleId) => {
    try {
      setRolesLoading(true);
      const response = await addRoleToUser(userId, roleId);

      if (response?.status === 1) {
        setToast({
          show: true,
          message: "Thêm vai trò thành công!",
          type: "success",
        });
        // Refresh users list và cập nhật selectedUser
        await refreshData();
        // Cập nhật selectedUser với data mới
        const updatedUser = users.find((u) => u.id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      } else {
        setToast({
          show: true,
          message: response?.message || "Lỗi khi thêm vai trò!",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Lỗi khi thêm vai trò!",
        type: "error",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const handleRemoveRoleFromUser = async (userId, roleId) => {
    try {
      setRolesLoading(true);
      const response = await removeRoleFromUser(userId, roleId);

      if (response?.status === 1) {
        setToast({
          show: true,
          message: "Xóa vai trò thành công!",
          type: "success",
        });
        // Refresh users list và cập nhật selectedUser
        await refreshData();
        // Cập nhật selectedUser với data mới
        const updatedUser = users.find((u) => u.id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      } else {
        setToast({
          show: true,
          message: response?.message || "Lỗi khi xóa vai trò!",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Lỗi khi xóa vai trò!",
        type: "error",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setShowRolesModal(true);
  };

  const handleCloseRolesModal = () => {
    setShowRolesModal(false);
    setSelectedUser({ ...emptyUser });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setErrors({});
  };

  const handleShowModal = useCallback((user = null) => {
    if (user) {
      setSelectedUser(user);
      setEditMode(true);
    } else {
      setSelectedUser({ ...emptyUser });
      setEditMode(false);
    }
    setShowModal(true);
    setErrors({});
  }, []);

  const validateForm = () => {
    const validation = validateUserData(selectedUser, !editMode);
    setErrors(
      validation.errors.reduce((acc, error) => {
        // Map validation errors to field names
        if (error.includes("Username") || error.includes("Tên đăng nhập"))
          acc.username = error;
        else if (error.includes("Tên đầy đủ") || error.includes("Họ tên"))
          acc.fullName = error;
        else if (error.includes("Mật khẩu")) acc.password = error;
        else if (error.includes("Email")) acc.email = error;
        else if (error.includes("Số điện thoại")) acc.phone = error;
        else if (
          error.includes("Loại user") ||
          error.includes("Loại tài khoản")
        )
          acc.userType = error;
        else if (error.includes("Trạng thái")) acc.status = error;
        else if (error.includes("Vai trò")) acc.roleIds = error;
        else acc.general = error;
        return acc;
      }, {})
    );

    // Thêm validation cho roleIds nếu cần
    if (
      !editMode &&
      (!selectedUser.roleIds || selectedUser.roleIds.length === 0)
    ) {
      setErrors((prev) => ({
        ...prev,
        roleIds: "Vui lòng chọn ít nhất một vai trò",
      }));
      return false;
    }

    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const userDataForAPI = mapUserToAPI(selectedUser);

      if (editMode) {
        // Update user
        const response = await updateUser(userDataForAPI);

        if (response?.status === 1) {
          setToast({
            show: true,
            message: "Cập nhật người dùng thành công!",
            type: "success",
          });
          // Refresh users list from API
          const usersData = await getUsers({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            searchTerm: filters.search,
          });
          if (usersData?.status === 1) {
            const usersFromAPI = usersData.data?.items || [];
            const mappedUsers = usersFromAPI.map(mapUserFromAPI);
            setUsers(mappedUsers);
          }
        } else {
          setToast({
            show: true,
            message: response?.message || "Lỗi khi cập nhật người dùng!",
            type: "error",
          });
        }
      } else {
        // Create new user
        const response = await createUser(userDataForAPI);

        if (response?.status === 1) {
          setToast({
            show: true,
            message: "Thêm người dùng thành công!",
            type: "success",
          });
          // Refresh users list from API
          const usersData = await getUsers({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            searchTerm: filters.search,
          });
          if (usersData?.status === 1) {
            const usersFromAPI = usersData.data?.items || [];
            const mappedUsers = usersFromAPI.map(mapUserFromAPI);
            setUsers(mappedUsers);
          }
        } else {
          setToast({
            show: true,
            message: response?.message || "Lỗi khi tạo người dùng!",
            type: "error",
          });
        }
      }
      handleCloseModal();
    } catch (error) {
      setToast({
        show: true,
        message: "Lỗi khi lưu người dùng!",
        type: "error",
      });
    }
  };

  const handleDeleteUser = async (targetUser) => {
    // Check permissions using hierarchy
    const permissions = canModifyUser(currentUser, targetUser);

    if (!permissions.canDelete) {
      const errorMessage = `Bạn không có quyền xóa người dùng này. Cần level ${targetUser.userLevel - 1} trở lên.`;
      setToast({ show: true, message: errorMessage, type: "error" });
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa người dùng "${
          targetUser.fullName || targetUser.username
        }"?`
      )
    ) {
      try {
        const response = await deleteUser(targetUser.id);

        if (response?.status === 1) {
          setToast({
            show: true,
            message: "Xóa người dùng thành công!",
            type: "success",
          });
          // Refresh users list from API
          const usersData = await getUsers({
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            searchTerm: filters.search,
          });
          if (usersData?.status === 1) {
            const usersFromAPI = usersData.data?.items || [];
            const mappedUsers = usersFromAPI.map(mapUserFromAPI);
            setUsers(mappedUsers);
          }
        } else {
          setToast({
            show: true,
            message: response?.message || "Lỗi khi xóa người dùng!",
            type: "error",
          });
        }
      } catch (error) {
        setToast({
          show: true,
          message: "Lỗi khi xóa người dùng!",
          type: "error",
        });
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find the user to update
      const userToUpdate = users.find((user) => user.id === id);
      if (!userToUpdate) {
        return;
      }

      // Prepare data for API
      const userDataForAPI = mapUserToAPI({
        ...userToUpdate,
        status: newStatus,
      });

      const response = await updateUser(userDataForAPI);

      if (response?.status === 1) {
        setToast({
          show: true,
          message: "Cập nhật trạng thái thành công!",
          type: "success",
        });
        // Refresh users list from API
        const usersData = await getUsers({
          page: currentPage,
          pageSize: itemsPerPage,
          keyword: filters.search,
        });
        if (usersData?.status === 1) {
          const usersFromAPI = usersData.data?.items || [];
          const mappedUsers = usersFromAPI.map(mapUserFromAPI);
          setUsers(mappedUsers);
        }
      } else {
        setToast({
          show: true,
          message: response?.message || "Lỗi khi cập nhật trạng thái!",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Lỗi khi cập nhật trạng thái!",
        type: "error",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Function để refresh data từ API
  const refreshData = async () => {
    setLoading(true);
    try {
      const [rolesData, usersData] = await Promise.all([
        getAllRoles(),
        getUsers({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          searchTerm: filters.search,
        }),
      ]);

      if (rolesData?.data?.items) {
        const rolesArray = rolesData.data.items || [];
        const activeRoles = rolesArray.filter((role) => role.status === 1);
        setRoles(activeRoles);
      }

      if (usersData?.status === 1) {
        const usersFromAPI = usersData.data?.items || [];
        const mappedUsers = usersFromAPI.map(mapUserFromAPI);
        setUsers(mappedUsers);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Helper function để lấy tên role từ roleNames, roles hoặc roleIds (backward compatibility)
  const getRoleNames = (user) => {
    // Ưu tiên sử dụng roleNames từ BE (mới nhất)
    if (
      user.roleNames &&
      Array.isArray(user.roleNames) &&
      user.roleNames.length > 0
    ) {
      return user.roleNames.join(", ");
    }

    // Fallback về roles array
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles.map((role) => role.name).join(", ");
    }

    // Fallback cuối cùng về roleIds nếu roleNames và roles không có
    if (
      user.roleIds &&
      Array.isArray(user.roleIds) &&
      user.roleIds.length > 0
    ) {
      const safeRoles = Array.isArray(roles) ? roles : [];
      return user.roleIds
        .map((roleId) => {
          const role = safeRoles.find((r) => r.id === roleId);
          return role ? role.name : `Role ${roleId}`;
        })
        .join(", ");
    }

    return "";
  };

  // Filter users theo các điều kiện
  const filteredUsers = (users || []).filter((user) => {
    // Filter theo search term
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        user.username,
        user.fullName,
        user.email,
        user.phone,
      ].filter(Boolean); // Loại bỏ null/undefined

      const hasMatch = searchFields.some((field) =>
        field.toLowerCase().includes(searchTerm)
      );
      if (!hasMatch) return false;
    }

    // Filter theo userType
    if (filters.userType !== "") {
      const filterUserType = parseInt(filters.userType);
      if (user.userType !== filterUserType) return false;
    }

    // Filter theo role
    if (filters.role && filters.role !== "") {
      const userRoleNames = getRoleNames(user);
      if (!userRoleNames.toLowerCase().includes(filters.role.toLowerCase())) {
        return false;
      }
    }

    // Filter theo status
    if (filters.status !== "") {
      const filterStatus = parseInt(filters.status);
      if (user.status !== filterStatus) return false;
    }

    return true;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortConfig.key === "id") {
      return sortConfig.direction === "asc" ? a.id - b.id : b.id - a.id;
    }
    if (sortConfig.key === "username") {
      return sortConfig.direction === "asc"
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
    }
    if (sortConfig.key === "fullName") {
      return sortConfig.direction === "asc"
        ? (a.fullName || "").localeCompare(b.fullName || "")
        : (b.fullName || "").localeCompare(a.fullName || "");
    }
    if (sortConfig.key === "email") {
      return sortConfig.direction === "asc"
        ? (a.email || "").localeCompare(b.email || "")
        : (b.email || "").localeCompare(a.email || "");
    }
    if (sortConfig.key === "userType") {
      return sortConfig.direction === "asc"
        ? a.userType - b.userType
        : b.userType - a.userType;
    }
    if (sortConfig.key === "roles") {
      const aRoles = getRoleNames(a);
      const bRoles = getRoleNames(b);
      return sortConfig.direction === "asc"
        ? aRoles.localeCompare(bRoles)
        : bRoles.localeCompare(aRoles);
    }
    if (sortConfig.key === "status") {
      return sortConfig.direction === "asc"
        ? a.status - b.status
        : b.status - a.status;
    }
    if (sortConfig.key === "lastLogin") {
      const aDate = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
      const bDate = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
      return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
    }
    return 0;
  });

  // Sử dụng sortedUsers cho pagination
  const paginatedUsers = sortedUsers;

  // Tính totalPages dựa trên filtered users
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "50px",
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
      width: "110px",
    },
    {
      key: "fullName",
      label: "Họ tên",
      sortable: true,
      width: "140px",
      render: (row) => String(row.FullName || row.fullName || "Chưa cập nhật"),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      width: "180px",
      render: (row) => String(row.Email || row.email || "Chưa cập nhật"),
    },
    {
      key: "userType",
      label: "Cấp độ",
      sortable: true,
      width: "100px",
      render: (row) => {
        // Use roleId directly for display
        const roleId = row.roleId || 3; // Default to editor
        const shortText = getRoleText(roleId).toUpperCase();
        
        return (
          <span
            className={`badge bg-${getRoleColor(roleId)}`}
            title={getRoleText(roleId)}
          >
            {shortText}
          </span>
        );
      },
    },
    {
      key: "roles",
      label: "Vai trò",
      sortable: true,
      width: "120px",
      render: (row) => {
        const roleNames = getRoleNames(row);
        return roleNames ? (
          <span
            className="role-badge"
            style={{ fontSize: "0.65rem", wordBreak: "break-word" }}
          >
            {roleNames.length > 15
              ? roleNames.substring(0, 15) + "..."
              : roleNames}
          </span>
        ) : (
          "Chưa phân quyền"
        );
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      width: "80px",
      render: (row) => (
        <span
          className={`status-badge ${row.status === 1 ? "active" : "inactive"}`}
          style={{ fontSize: "0.8rem" }}
        >
          {row.status === 1 ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    {
      key: "lastLogin",
      label: "Đăng nhập cuối",
      sortable: true,
      width: "130px",
      render: (row) => {
        const lastLogin = row.LastLogin || row.lastLogin;try {
          return lastLogin
            ? new Date(lastLogin).toLocaleDateString("vi-VN")
            : "Chưa đăng nhập";
        } catch (error) {
          return "Invalid date";
        }
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "120px",
      render: (row) => {
        const permissions = canModifyUser(currentUser, row);

        return (
          <div
            className="action-buttons"
            style={{ display: "flex", gap: "4px" }}
          >
            {permissions.canEdit && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleEdit(row)}
                title="Chỉnh sửa"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                <i className="bi bi-pencil"></i>
                <span>Sửa</span>
              </button>
            )}

            {permissions.canDelete && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteUser(row)}
                title="Xóa"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                <i className="bi bi-trash"></i>
                <span>Xóa</span>
              </button>
            )}

            {permissions.canViewDetails && !permissions.canEdit && (
              <button
                className="btn btn-sm btn-info"
                onClick={() => handleViewDetails(row.id)}
                title="Xem chi tiết"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                <i className="bi bi-eye"></i>
              </button>
            )}

            {/* Nút quản lý roles */}
            {permissions.canEdit && (
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleManageRoles(row)}
                title="Quản lý vai trò"
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  border: "1px solid #ffc107",
                  color: "#856404",
                }}
              >
                <i className="bi bi-shield-fill me-1"></i>
                <span>Roles</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const renderFilters = () => {
    // Đảm bảo roles luôn là array
    const safeRoles = Array.isArray(roles) ? roles : [];

    return (
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="form-control"
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.userType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userType: e.target.value }))
            }
            className="form-control"
          >
            <option value="">Tất cả loại tài khoản</option>
            <option value={1}>System Administrator</option>
            <option value={2}>Manager/Admin</option>
            <option value={3}>Staff/Editor</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.role}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, role: e.target.value }))
            }
            className="form-control"
          >
            <option value="">Tất cả vai trò</option>
            {safeRoles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="form-control"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={1}>Hoạt động</option>
            <option value={0}>Không hoạt động</option>
          </select>
        </div>
      </div>
    );
  };

  const renderRolesModal = () => (
    <div className="roles-management">
      {/* Loading overlay */}
      {rolesLoading && (
        <div
          className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            top: 0,
            left: 0,
            backgroundColor: "rgba(255,255,255,0.8)",
            zIndex: 1000,
            borderRadius: "8px",
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="user-info mb-4 p-3 bg-light rounded">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <i className="bi bi-person-circle fs-1 text-primary"></i>
          </div>
          <div>
            <h5 className="mb-1">
              Quản lý vai trò cho:{" "}
              <strong className="text-primary">{selectedUser.username}</strong>
            </h5>
            <p className="text-muted mb-0">
              <i className="bi bi-person me-1"></i>
              {selectedUser.fullName}
            </p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Vai trò hiện tại */}
        <div className="col-md-6">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Vai trò hiện tại ({selectedUser.roleNames?.length || 0})
              </h6>
            </div>
            <div className="card-body">
              {selectedUser.roleNames && selectedUser.roleNames.length > 0 ? (
                <div>
                  {selectedUser.roleNames.map((roleName, index) => {
                    const role = Array.isArray(roles)
                      ? roles.find((r) => r.name === roleName)
                      : null;
                    return role ? (
                      <div
                        key={role.id}
                        className="role-item mb-3 p-3 border rounded bg-light"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-shield-fill text-primary me-2"></i>
                              <strong className="text-primary">
                                {role.name}
                              </strong>
                            </div>
                            <small className="text-muted d-block">
                              {role.description}
                            </small>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleRemoveRoleFromUser(selectedUser.id, role.id)
                            }
                            title="Xóa vai trò"
                            disabled={rolesLoading}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="role-item mb-3 p-3 border rounded bg-light"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i className="bi bi-shield me-2"></i>
                            <strong>{roleName}</strong>
                          </div>
                          <span className="text-muted small">
                            Không thể xóa
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-shield-x text-muted fs-1"></i>
                  <p className="text-muted mt-2">Chưa có vai trò nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thêm vai trò mới */}
        <div className="col-md-6">
          <div className="card h-100 border-success">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Thêm vai trò mới
              </h6>
            </div>
            <div className="card-body">
              {Array.isArray(roles) && roles.length > 0 ? (
                <div>
                  {roles.map((role) => {
                    const hasRole =
                      selectedUser.roleNames &&
                      selectedUser.roleNames.includes(role.name);

                    return (
                      <div
                        key={role.id}
                        className={`role-item mb-3 p-3 border rounded ${
                          hasRole ? "bg-success bg-opacity-10" : "bg-light"
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <i
                                className={`bi ${
                                  hasRole
                                    ? "bi-shield-check text-success"
                                    : "bi-shield text-muted"
                                } me-2`}
                              ></i>
                              <strong
                                className={
                                  hasRole ? "text-success" : "text-dark"
                                }
                              >
                                {role.name}
                              </strong>
                              {hasRole && (
                                <span className="badge bg-success ms-2">
                                  Đã có
                                </span>
                              )}
                            </div>
                            <small className="text-muted d-block">
                              {role.description}
                            </small>
                          </div>
                          {hasRole ? (
                            <span className="text-success">
                              <i className="bi bi-check-circle-fill"></i>
                            </span>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleAddRoleToUser(selectedUser.id, role.id)
                              }
                              title="Thêm vai trò"
                              disabled={rolesLoading}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-shield-x text-muted fs-1"></i>
                  <p className="text-muted mt-2">
                    Không có vai trò nào khả dụng
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserForm = () => (
    <div className="user-form">
      <div className="form-row">
        <div className="form-group">
          <label>Tên đăng nhập *</label>
          <input
            type="text"
            value={selectedUser.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            placeholder="Nhập tên đăng nhập (tối đa 50 ký tự)"
            maxLength={50}
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
          )}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={selectedUser.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Nhập email (tối đa 100 ký tự)"
            maxLength={100}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Họ tên *</label>
          <input
            type="text"
            value={selectedUser.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
            placeholder="Nhập họ tên (tối đa 100 ký tự)"
            maxLength={100}
          />
          {errors.fullName && (
            <div className="invalid-feedback">{errors.fullName}</div>
          )}
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            value={selectedUser.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
            placeholder="Nhập số điện thoại (tối đa 20 ký tự)"
            maxLength={20}
          />
          {errors.phone && (
            <div className="invalid-feedback">{errors.phone}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Loại tài khoản *</label>
          <select
            value={selectedUser.userType}
            onChange={(e) =>
              handleInputChange("userType", parseInt(e.target.value))
            }
            className={`form-control ${errors.userType ? "is-invalid" : ""}`}
          >
            <option value="">Chọn loại tài khoản</option>
            {getAssignableRoles(currentUser).map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.userType && (
            <div className="invalid-feedback">{errors.userType}</div>
          )}
          <small className="form-text text-muted">
            Bạn chỉ có thể tạo user với cấp độ thấp hơn hoặc bằng của mình
          </small>
        </div>
        <div className="form-group">
          <label>Trạng thái *</label>
          <select
            value={selectedUser.status}
            onChange={(e) =>
              handleInputChange("status", parseInt(e.target.value))
            }
            className={`form-control ${errors.status ? "is-invalid" : ""}`}
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Không hoạt động</option>
          </select>
          {errors.status && (
            <div className="invalid-feedback">{errors.status}</div>
          )}
        </div>
      </div>

      {!editMode && (
        <div className="form-row">
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input
              type="password"
              value={selectedUser.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              minLength={6}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
        </div>
      )}

      {/* Vai trò - Hiển thị khác nhau cho Create và Edit */}
      <div className="form-row">
        <div className="form-group">
          <label>Vai trò {editMode ? "hiện tại" : ""}</label>

          {editMode ? (
            // Khi Edit: Hiển thị roles hiện tại + cho phép thay đổi
            <div>
              {/* Hiển thị roles hiện tại */}
              <div
                className="form-control mb-2"
                style={{ minHeight: "60px", backgroundColor: "#f8f9fa" }}
              >
                {selectedUser.roleNames && selectedUser.roleNames.length > 0 ? (
                  <div>
                    {selectedUser.roleNames.map((roleName, index) => (
                      <span key={index} className="badge bg-success me-1 mb-1">
                        {roleName}
                      </span>
                    ))}
                  </div>
                ) : selectedUser.roles && selectedUser.roles.length > 0 ? (
                  <div>
                    {selectedUser.roles.map((role) => (
                      <span
                        key={role.id}
                        className="badge bg-success me-1 mb-1"
                      >
                        {role.name}{" "}
                        {role.status === 1
                          ? "(Hoạt động)"
                          : "(Không hoạt động)"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">Chưa phân quyền</span>
                )}
              </div>

              {/* Dropdown để thay đổi roles */}
              <div>
                <small className="text-muted mb-2 d-block">
                  Thay đổi vai trò:
                </small>
                <select
                  multiple
                  value={selectedUser.roleIds || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions,
                      (option) => parseInt(option.value)
                    );
                    handleInputChange("roleIds", selectedOptions);
                  }}
                  className={`form-control ${
                    errors.roleIds ? "is-invalid" : ""
                  }`}
                  style={{ minHeight: "80px" }}
                >
                  {Array.isArray(roles) &&
                    roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                </select>
                {errors.roleIds && (
                  <div className="invalid-feedback">{errors.roleIds}</div>
                )}
                <small className="form-text text-muted">
                  Giữ Ctrl để chọn nhiều vai trò
                </small>
              </div>
            </div>
          ) : (
            // Khi Create: Checkbox list để chọn vai trò
            <div>
              <div
                className={`user-roles-container ${
                  errors.roleIds ? "is-invalid" : ""
                }`}
              >
                {Array.isArray(roles) && roles.length > 0 ? (
                  roles.map((role) => (
                    <div key={role.id} className="user-role-item">
                      <input
                        type="checkbox"
                        className="user-role-checkbox"
                        id={`role-${role.id}`}
                        checked={(selectedUser.roleIds || []).includes(role.id)}
                        onChange={(e) => {
                          const currentRoleIds = selectedUser.roleIds || [];
                          const newRoleIds = e.target.checked
                            ? [...currentRoleIds, role.id]
                            : currentRoleIds.filter((id) => id !== role.id);
                          handleInputChange("roleIds", newRoleIds);
                        }}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="user-role-label"
                      >
                        <strong>{role.name}</strong>
                        {role.description && (
                          <small className="user-role-description">
                            {role.description}
                          </small>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="user-roles-empty">
                    Không có vai trò nào khả dụng
                  </div>
                )}
              </div>
              {errors.roleIds && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {errors.roleIds}
                </div>
              )}
              <small className="form-text text-muted">
                Chọn một hoặc nhiều vai trò cho người dùng
              </small>
            </div>
          )}

          {/* Hiển thị roles đã chọn (cho cả Create và Edit) */}
          {selectedUser.roleIds && selectedUser.roleIds.length > 0 && (
            <div className="mt-2">
              <small className="text-muted">Vai trò đã chọn:</small>
              <div className="mt-1">
                {selectedUser.roleIds.map((roleId) => {
                  const role = Array.isArray(roles)
                    ? roles.find((r) => r.id === roleId)
                    : null;
                  return role ? (
                    <span
                      key={roleId}
                      className="badge bg-primary me-1"
                      title={role.description}
                    >
                      {role.name}
                    </span>
                  ) : (
                    <span key={roleId} className="badge bg-secondary me-1">
                      Role {roleId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị thông tin bổ sung khi edit */}
      {editMode && (
        <div className="form-row">
          <div className="form-group">
            <label>Đăng nhập cuối</label>
            <input
              type="text"
              value={
                selectedUser.lastLogin
                  ? new Date(selectedUser.lastLogin).toLocaleString("vi-VN")
                  : "Chưa đăng nhập"
              }
              className="form-control"
              readOnly
            />
          </div>
        </div>
      )}

      {/* Hiển thị quyền hạn */}
      {editMode && (
        <div className="form-row">
          <div className="form-group">
            <label>Vai trò</label>
            <textarea
              value={
                Array.isArray(selectedUser.roles)
                  ? selectedUser.roles.join(", ")
                  : ""
              }
              className="form-control"
              rows={3}
              readOnly
              placeholder="Danh sách vai trò"
            />
          </div>
        </div>
      )}

      {/* Thông tin validation */}
      <div className="form-row">
        <div className="col-12">
          <div className="alert alert-info">
            <strong>Lưu ý:</strong>
            <ul className="mb-0 mt-2">
              <li>Tên đăng nhập: Tối đa 50 ký tự</li>
              <li>Họ tên: Tối đa 100 ký tự</li>
              <li>Email: Tối đa 100 ký tự (không bắt buộc)</li>
              <li>Số điện thoại: Tối đa 20 ký tự (không bắt buộc)</li>
              <li>Mật khẩu: Tối thiểu 6 ký tự (chỉ khi tạo mới)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Check access permission
  if (!canManageUsers(currentUser)) {
    return (
      <PageWrapper>
        <AccessDenied
          message="Bạn không có quyền quản lý người dùng"
          user={
            currentUser
              ? {
                  userLevel: currentUser.userLevel,
                  userType: currentUser.userType,
                  name: currentUser.name,
                  username: currentUser.username,
                }
              : null
          }
        />
      </PageWrapper>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const pageActions = (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        className="btn btn-secondary"
        onClick={refreshData}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#6b7280",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
      >
        <i className="bi bi-arrow-clockwise"></i>
        Làm mới
      </button>
      {canCreateUser(currentUser) && (
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          <i className="bi bi-plus"></i>
          Thêm người dùng
        </button>
      )}
    </div>
  );

  return (
    <PageWrapper actions={pageActions}>
      <div className="admin-user-management">
        {renderFilters()}

        <div className="admin-table-container">
          {/* Hiển thị thông tin kết quả filter */}
          <div className="filter-results mb-3">
            <small className="text-muted">
              Hiển thị {sortedUsers.length} trong tổng số {users.length} người
              dùng
              {filters.search ||
              filters.userType !== "" ||
              filters.role ||
              filters.status !== "" ? (
                <span className="ms-2">(đã lọc theo điều kiện)</span>
              ) : (
                ""
              )}
            </small>
          </div>

          {/* Table data check completed */}
          <DataTable
            data={paginatedUsers}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            sortConfig={sortConfig}
            onSort={handleSort}
            itemsPerPage={itemsPerPage}
            totalItems={sortedUsers.length}
            tableClassName="admin-table"
          />
        </div>

        <FormModal
          show={showModal}
          onClose={handleCloseModal}
          title={editMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          onSubmit={handleSubmit}
          submitText={editMode ? "Cập nhật" : "Thêm"}
          width={1200}
        >
          {renderUserForm()}
        </FormModal>

        {/* Roles Management Modal */}
        <FormModal
          show={showRolesModal}
          onClose={handleCloseRolesModal}
          title="Quản lý vai trò người dùng"
          width={1000}
          hideSubmitButton={true}
        >
          <div className="position-relative">{renderRolesModal()}</div>
        </FormModal>

        <ToastMessage
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    </PageWrapper>
  );
};

export default UserManagement;
