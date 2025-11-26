import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleColor, getRoleText, getAllRoles } from "../../utils/roleUtils";
import { canModifyUser } from "../../utils/hierarchyUtils";
import {
  fetchUsers,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getRoleText as getServiceRoleText,
} from "../../services/userService";
import { getRoles } from "../../services/roleService";
import PageWrapper from "../components/PageWrapper";
import AdminTable from "../components/AdminTable";
import FormModal from "../components/FormModal";
import LoadingSpinner from "../components/LoadingSpinner";
import ToastMessage from "../components/ToastMessage";
import AccessDenied from "../../components/AccessDenied";
import AdminFilter from "../components/AdminFilter";
import "./ContactList.css";
import "./UserManagement.css";
import "../styles/adminTable.css";
import "../styles/adminCommon.css";
import "../styles/adminPageStyles.css";
import "../styles/adminButtons.css";

const UserManagement = () => {
  const { user: currentUser, ROLES } = useAuth();

  // Data state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchDebounce, setSearchDebounce] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    roleId: null, // Will be set dynamically based on available roles
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});

  // Simple role filtering based on hierarchy
  const getFilteredRoles = () => {
    if (!roles || roles.length === 0) {
      // Return default roles if no roles loaded
      return [
        { id: 1, name: "SuperAdmin" },
        { id: 2, name: "Manager" },
        { id: 3, name: "Editor" },
        { id: 4, name: "User" },
      ];
    }

    // Cho phép tất cả 4 roles: 1, 2, 3, 4
    return roles.filter((role) => [1, 2, 3, 4].includes(role.id));
  };

  // Filter config for AdminFilter component
  const filterConfig = [
    {
      key: "search",
      type: "search",
      label: "Tìm kiếm",
      placeholder: "Nhập tên đăng nhập, email hoặc họ tên...",
      icon: "fas fa-search",
    },
    {
      key: "role",
      type: "select",
      label: "Vai trò",
      icon: "fas fa-user-tag",
      options: getFilteredRoles().map((role) => ({
        value: role.id,
        label: role.name,
      })),
    },
    {
      key: "status",
      type: "select",
      label: "Trạng thái",
      icon: "fas fa-toggle-on",
      options: [
        { value: "active", label: "Hoạt động" },
        { value: "inactive", label: "Tạm khóa" },
      ],
    },
  ];

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Debounce search - đợi user gõ xong
  useEffect(() => {
    if (filters.search !== searchDebounce) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
      setIsSearching(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Load data function (following NewsList pattern)
  const loadData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setIsLoading(true);
    }
    try {
      const [usersData, rolesData] = await Promise.all([
        fetchUsers(
          currentPage,
          itemsPerPage,
          searchDebounce,
          filters,
          sortConfig
        ),
        getRoles({ size: 100 }),
      ]);

      // Handle users data (fetchUsers returns direct data, not wrapped in status/data)
      const mappedUsers = (usersData?.items || []).map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        roleName: user.roleName,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      }));

      setUsers(mappedUsers);
      setTotalItems(usersData?.totalItems || 0);
      setTotalPages(usersData?.totalPages || 0);

      // Handle roles data
      if (rolesData && rolesData.data && rolesData.data.items) {
        setRoles(rolesData.data.items);
      } else {
      }
    } catch (error) {
      showToast("Tải dữ liệu thất bại: " + error.message, "error");
    } finally {
      if (showLoadingIndicator) {
        setIsLoading(false);
      }
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Load data when pagination/filters/sorting change
  useEffect(() => {
    if (searchDebounce !== filters.search) {
      // Search is still being debounced, don't show loading
      loadData(false);
    } else {
      // Other filters or pagination changed, show loading
      loadData(true);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchDebounce,
    filters.role,
    filters.status,
    sortConfig,
  ]);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleCreate = () => {
    setEditMode(false);
    setEditingUser(null);

    // Get default role - cho phép roleId 1, 2, 3, 4
    const defaultRoleId = 4; // Default to User role (lowest privilege)

    setFormData({
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      roleId: defaultRoleId,
      status: "active",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    const permissions = canModifyUser(currentUser, user);
    if (!permissions.canEdit) {
      showToast("Bạn không có quyền chỉnh sửa người dùng này", "error");
      return;
    }

    setEditMode(true);
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Don't show existing password
      email: user.email || "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      roleId: user.roleId,
      status: user.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    const permissions = canModifyUser(currentUser, user);
    if (!permissions.canDelete) {
      showToast("Bạn không có quyền xóa người dùng này", "error");
      return;
    }

    if (
      window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)
    ) {
      try {
        const response = await deleteUser(user.id);

        if (response.status === 1) {
          showToast("Xóa người dùng thành công", "success");
          loadData(false); // Reload data from server without loading indicator
        } else {
          throw new Error(response.message || "Xóa thất bại");
        }
      } catch (error) {
        showToast(error.message || "Không thể xóa người dùng", "error");
      }
    }
  };

  const handleResetPassword = (user) => {
    const permissions = canModifyUser(currentUser, user);
    if (!permissions.canEdit) {
      showToast("Bạn không có quyền đặt lại mật khẩu người dùng này", "error");
      return;
    }

    setResetPasswordUser(user);
    setNewPassword("");
    setShowResetPasswordModal(true);
  };

  const handleSubmitResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast("Mật khẩu phải có ít nhất 6 ký tự", "error");
      return;
    }

    try {
      const response = await resetPassword(resetPasswordUser.id, newPassword);

      if (response.status === 1) {
        showToast(`Đặt lại mật khẩu cho "${resetPasswordUser.fullName}" thành công`, "success");
        setShowResetPasswordModal(false);
        setResetPasswordUser(null);
        setNewPassword("");
      } else {
        throw new Error(response.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      showToast(error.message || "Không thể đặt lại mật khẩu", "error");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Tên đăng nhập là bắt buộc";
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ tên là bắt buộc";
    }

    // Email required for create user
    if (!editMode && !formData.email) {
      errors.email = "Email là bắt buộc";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!editMode && users.some((u) => u.username === formData.username)) {
      errors.username = "Tên đăng nhập đã tồn tại";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editMode) {
        // Update user - theo UpdateUserDto
        const updateData = {
          id: editingUser.id,
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email || null,
          phone: formData.phone || null,
          roleId: formData.roleId,
          status: formData.status === "active" ? 1 : 0,
        };

        const response = await updateUser(updateData);

        if (response.status === 1) {
          showToast("Cập nhật người dùng thành công", "success");
          loadData(false); // Reload data from server without loading indicator
        } else {
          throw new Error(response.message || "Cập nhật thất bại");
        }
      } else {
        // Create user - theo CreateUserDto
        // Get default role if not selected - chỉ cho phép 1, 2, 3
        let roleId = formData.roleId;
        if (!roleId) {
          roleId = 4; // Default to role 4 (User - lowest privilege)
        }

        // Validate roleId - chấp nhận 1, 2, 3, 4
        const validRoleIds = [1, 2, 3, 4];
        if (!validRoleIds.includes(parseInt(roleId))) {
          roleId = 4; // Fallback to User role
        }

        const createData = {
          username: formData.username?.trim(),
          password: formData.password?.trim(),
          fullName: formData.fullName?.trim(),
          email: formData.email?.trim(), // Required theo document
          phone: formData.phone?.trim() || "",
          roleId: parseInt(roleId),
          status: formData.status === "active" ? 1 : 0,
        };

        // Validate required fields
        if (!createData.username) {
          throw new Error("Tên đăng nhập là bắt buộc");
        }
        if (!createData.password) {
          throw new Error("Mật khẩu là bắt buộc");
        }
        if (!createData.fullName) {
          throw new Error("Họ tên là bắt buộc");
        }
        if (!createData.email) {
          throw new Error("Email là bắt buộc");
        }

        const response = await createUser(createData);

        if (response.Status === 1) {
          showToast("Tạo người dùng thành công", "success");
          loadData(false); // Reload data from server without loading indicator
        } else {
          throw new Error(response.Message || "Tạo thất bại");
        }
      }

      setShowModal(false);
    } catch (error) {
      showToast(
        error.message ||
          (editMode
            ? "Không thể cập nhật người dùng"
            : "Không thể tạo người dùng"),
        "error"
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa đăng nhập";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const columns = [
    {
      key: "username",
      label: "Tên đăng nhập",
      sortable: true,
      width: "18%",
    },
    {
      key: "fullName",
      label: "Họ tên",
      sortable: true,
      width: "20%",
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      width: "25%",
      render: (row) => row.email || "Chưa có",
    },
    {
      key: "role",
      label: "Vai trò",
      sortable: true,
      width: "12%",
      render: (row) => {
        const roleId = row.roleId || 3;
        return (
          <span
            className={`badge bg-${getRoleColor(roleId)}`}
            title={getRoleText(roleId)}
          >
            {getRoleText(roleId)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      width: "10%",
      render: (row) => (
        <span
          className={`badge ${
            row.status === "active" ? "bg-success" : "bg-danger"
          }`}
        >
          {row.status === "active" ? "Hoạt động" : "Tạm khóa"}
        </span>
      ),
    },
    {
      key: "lastLogin",
      label: "Đăng nhập cuối",
      sortable: true,
      width: "15%",
      render: (row) => formatDate(row.lastLogin),
    },
  ];

  // Page Actions for the sticky action bar
  const pageActions = (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        className="admin-btn admin-btn-outline-secondary"
        onClick={() => loadData(true)}
        disabled={isLoading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#f8f9fa",
          color: "#6c757d",
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
        title="Làm mới danh sách người dùng"
      >
        <i className="fas fa-refresh"></i>
        Làm mới
      </button>
      <button
        className="admin-btn admin-btn-primary"
        onClick={handleCreate}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
      >
        <i className="fas fa-plus"></i>
        Thêm người dùng
      </button>
    </div>
  );

  // Check permission - only Admin and SuperAdmin can manage users
  if (!currentUser || currentUser.roleId > ROLES.ADMIN) {
    return (
      <PageWrapper actions={pageActions}>
        <AccessDenied
          message="Bạn không có quyền truy cập trang này. Chỉ Admin và SuperAdmin mới có thể quản lý người dùng."
          user={currentUser}
        />
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper actions={pageActions}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper actions={pageActions}>
      <div className="admin-contact-list">
        {/* Filters Section */}
        <AdminFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPageChange={setCurrentPage}
          filterConfig={filterConfig}
          isSearching={isSearching}
        />

        {/* Table Container */}
        <AdminTable
          data={users}
          columns={columns}
          actions={[
            {
              label: "Sửa",
              onClick: handleEdit,
              className: "admin-btn admin-btn-xs admin-btn-info",
              condition: (row) => canModifyUser(currentUser, row).canEdit,
            },
            {
              label: "Đặt lại MK",
              onClick: handleResetPassword,
              className: "admin-btn admin-btn-xs admin-btn-warning",
              condition: (row) => canModifyUser(currentUser, row).canEdit,
            },
            {
              label: "Xóa",
              onClick: handleDelete,
              className: "admin-btn admin-btn-xs admin-btn-danger",
              condition: (row) => canModifyUser(currentUser, row).canDelete,
            },
          ]}
          sortConfig={sortConfig}
          onSort={(key) => {
            setSortConfig((prev) => ({
              key,
              direction:
                prev.key === key && prev.direction === "desc" ? "asc" : "desc",
            }));
          }}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
          loading={isLoading}
        />

        {/* Form Modal */}
        <FormModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          title={editMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          size="md"
          submitText={editMode ? "Cập nhật" : "Tạo tài khoản"}
          loading={isLoading}
        >
          <div className="user-form">
            <div className="user-form-content">
              <div className="form-section">
                <h6 className="section-title">
                  <i className="bi bi-person"></i>
                  Thông tin cơ bản
                </h6>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-at"></i>
                      Tên đăng nhập <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.username ? "is-invalid" : ""
                      }`}
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Nhập tên đăng nhập"
                      disabled={editMode}
                    />
                    {formErrors.username && (
                      <div className="invalid-feedback">
                        {formErrors.username}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-person-badge"></i>
                      Họ và tên <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.fullName ? "is-invalid" : ""
                      }`}
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                    {formErrors.fullName && (
                      <div className="invalid-feedback">
                        {formErrors.fullName}
                      </div>
                    )}
                  </div>
                </div>

                {!editMode && (
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-shield-lock"></i>
                      Mật khẩu <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        formErrors.password ? "is-invalid" : ""
                      }`}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                    {formErrors.password && (
                      <div className="invalid-feedback">
                        {formErrors.password}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-section">
                <h6 className="section-title">
                  <i className="bi bi-envelope"></i>
                  Thông tin liên hệ
                </h6>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-envelope"></i>
                      Email {!editMode && <span className="required">*</span>}
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        formErrors.email ? "is-invalid" : ""
                      }`}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@domain.com"
                      required={!editMode}
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">{formErrors.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-telephone"></i>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="0xxxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h6 className="section-title">
                  <i className="bi bi-gear"></i>
                  Cài đặt tài khoản
                </h6>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-person-gear"></i>
                      Vai trò
                    </label>
                    <select
                      className="form-control form-select"
                      value={formData.roleId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roleId: parseInt(e.target.value),
                        })
                      }
                    >
                      {getFilteredRoles().map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-toggle-on"></i>
                      Trạng thái
                    </label>
                    <select
                      className="form-control form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormModal>

        {/* Reset Password Modal */}
        <FormModal
          show={showResetPasswordModal}
          onClose={() => {
            setShowResetPasswordModal(false);
            setResetPasswordUser(null);
            setNewPassword("");
          }}
          onSubmit={handleSubmitResetPassword}
          title={`Đặt lại mật khẩu - ${resetPasswordUser?.fullName || ""}`}
          size="sm"
          submitText="Đặt lại mật khẩu"
          loading={false}
        >
          <div className="reset-password-form">
            <div className="alert alert-warning" style={{ fontSize: "0.9rem", padding: "0.75rem" }}>
              <i className="bi bi-exclamation-triangle"></i> Bạn đang đặt lại mật khẩu cho người dùng <strong>{resetPasswordUser?.username}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-shield-lock"></i>
                Mật khẩu mới <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                autoFocus
              />
              <small className="form-text text-muted">
                Mật khẩu phải có ít nhất 6 ký tự
              </small>
            </div>
          </div>
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
