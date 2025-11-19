import React, { useState, useEffect } from "react";
import {
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
  syncCategoriesToMenus,
} from "../../services/adminMenuService";
import PageWrapper from "../components/PageWrapper";
import FormModal from "../components/FormModal";
import ToastMessage from "../components/ToastMessage";
import AdminPageActions from "../components/AdminPageActions";
import "../styles/adminCommon.css";
import "../styles/adminButtons.css";

const MenuManagement = () => {
  // Data state
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [editingMenu, setEditingMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Form data
  const [formData, setFormData] = useState({
    key: "",
    titleVi: "",
    titleEn: "",
    url: "",
    urlEn: "",
    parentId: null,
    order: 0,
    isActive: true,
    isExternal: false,
    target: "_self",
    menuType: "static",
    descriptionVi: "",
    descriptionEn: "",
  });

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenuList();
      setMenus(data);
    } catch (err) {setError(err.message);
      setToast({
        show: true,
        message: "Tải dữ liệu thất bại: " + err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  // Helper function to flatten menu tree for select dropdown
  const flattenMenusForSelect = (menuItems, level = 0) => {
    let result = [];
    menuItems.forEach((menu) => {
      result.push({ ...menu, level });
      if (menu.children && menu.children.length > 0) {
        result = result.concat(flattenMenusForSelect(menu.children, level + 1));
      }
    });
    return result;
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.key?.trim()) {
      errors.key = "Key là bắt buộc";
    }
    if (!formData.titleVi?.trim()) {
      errors.titleVi = "Tiêu đề tiếng Việt là bắt buộc";
    }
    if (!formData.titleEn?.trim()) {
      errors.titleEn = "Tiêu đề tiếng Anh là bắt buộc";
    }
    if (!formData.url?.trim()) {
      errors.url = "URL tiếng Việt là bắt buộc";
    }

    // URL format validation
    if (formData.url && !formData.url.startsWith("/")) {
      errors.url = "URL phải bắt đầu bằng dấu /";
    }
    if (
      formData.urlEn &&
      formData.urlEn.trim() &&
      !formData.urlEn.startsWith("/")
    ) {
      errors.urlEn = "URL tiếng Anh phải bắt đầu bằng dấu /";
    }

    // Parent validation - cannot be child of itself
    if (
      editingMenu &&
      formData.parentId &&
      parseInt(formData.parentId) === editingMenu.id
    ) {
      errors.parentId = "Không thể chọn chính nó làm parent";
    }

    // Order validation
    if (formData.order < 0) {
      errors.order = "Thứ tự phải là số không âm";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setToast({
        show: true,
        message:
          "Vui lòng kiểm tra lại thông tin: " +
          Object.values(validationErrors).join(", "),
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Prepare data for API - only send fields that API expects
      const submitData = {
        key: formData.key,
        titleVi: formData.titleVi,
        titleEn: formData.titleEn,
        url: formData.url,
        urlEn: formData.urlEn || null,
        parentId: formData.parentId || null,
        isActive: formData.isActive,
        isExternal: formData.isExternal,
        target: formData.target,
        descriptionVi: formData.descriptionVi || null,
        descriptionEn: formData.descriptionEn || null,
      };if (editingMenu) {
        await updateMenu(editingMenu.id, submitData);
        setToast({
          show: true,
          message: "Cập nhật menu thành công!",
          type: "success",
        });
      } else {
        await createMenu(submitData);
        setToast({
          show: true,
          message: "Thêm menu thành công!",
          type: "success",
        });
      }

      setShowModal(false);
      resetForm();
      loadMenus();
    } catch (err) {setToast({
        show: true,
        message: "Lỗi: " + (err.response?.data?.message || err.message || 'Không thể kết nối tới server'),
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingMenu(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (menu) => {
    setEditMode(true);
    setEditingMenu(menu);
    setFormData({
      key: menu.key || "",
      titleVi: menu.titleVi || "",
      titleEn: menu.titleEn || "",
      url: menu.url || "",
      urlEn: menu.urlEn || "",
      parentId: menu.parentId || null,
      order: menu.order || 0,
      isActive: menu.isActive !== undefined ? menu.isActive : true,
      isExternal: menu.isExternal || false,
      target: menu.target || "_self",
      menuType: menu.menuType || "static",
      descriptionVi: menu.descriptionVi || "",
      descriptionEn: menu.descriptionEn || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa menu này?")) {
      try {
        await deleteMenu(id);
        setToast({
          show: true,
          message: "Xóa menu thành công!",
          type: "success",
        });
        loadMenus();
      } catch (err) {
        setToast({
          show: true,
          message: "Lỗi xóa menu: " + err.message,
          type: "error",
        });
      }
    }
  };

  const handleSync = async () => {
    if (
      window.confirm(
        "Đồng bộ categories thành menus? Điều này có thể ghi đè dữ liệu hiện tại."
      )
    ) {
      try {
        const result = await syncCategoriesToMenus();
        setToast({
          show: true,
          message: `Đã đồng bộ thành công! Thêm ${result.totalAdded} menu items.`,
          type: "success",
        });
        loadMenus();
      } catch (err) {
        setToast({
          show: true,
          message: "Lỗi đồng bộ: " + err.message,
          type: "error",
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMenu(null);
    resetForm();
  };

  const resetForm = () => {
    setEditingMenu(null);
    setFormData({
      key: "",
      titleVi: "",
      titleEn: "",
      url: "",
      urlEn: "",
      parentId: null,
      order: 0,
      isActive: true,
      isExternal: false,
      target: "_self",
      menuType: "static",
      descriptionVi: "",
      descriptionEn: "",
    });
  };

  const renderMenuTree = (items, level = 0) => {
    return items.map((menu) => (
      <div key={menu.id} className={`menu-item level-${level} mb-3`}>
        <div
          className={`d-flex justify-content-between align-items-center p-3 border rounded ${
            level > 0 ? "bg-light" : "bg-white"
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="menu-info flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <i className="fas fa-bars text-muted me-2"></i>
              <strong className="text-dark">
                {menu.labelVi || menu.title}
              </strong>
              {(menu.labelEn || menu.titleEn) && (
                <span className="text-muted ms-2">
                  ({menu.labelEn || menu.titleEn})
                </span>
              )}
              {menu.order > 0 && (
                <span className="badge bg-secondary ms-2">{menu.order}</span>
              )}
              {menu.level >= 0 && (
                <span className="badge bg-info ms-1">L{menu.level}</span>
              )}
              {menu.isExternal && (
                <span className="badge bg-warning ms-1">External</span>
              )}
            </div>
            <div className="text-muted small">
              <i className="fas fa-link me-1"></i>
              {menu.pathVi || menu.url}
              {(menu.pathEn || menu.urlEn) && (
                <span> | {menu.pathEn || menu.urlEn}</span>
              )}
              {menu.key && <span className="text-info ms-2">#{menu.key}</span>}
            </div>
          </div>

          <div className="menu-actions">
            <button
              className="admin-btn admin-btn-xs admin-btn-primary me-2"
              onClick={() => handleEdit(menu)}
              title="Chỉnh sửa"
            >
              Sửa
            </button>
            <button
              className="admin-btn admin-btn-xs admin-btn-danger"
              onClick={() => handleDelete(menu.id)}
              title="Xóa"
            >
              Xóa
            </button>
          </div>
        </div>

        {menu.children && menu.children.length > 0 && (
          <div className="menu-children mt-2">
            {renderMenuTree(menu.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Page Actions using AdminPageActions
  const pageActions = (
    <AdminPageActions
      loading={loading}
      actions={[
        AdminPageActions.createRefreshAction(loadMenus, loading),
        {
          label: "Sync Categories",
          onClick: handleSync,
          className: "admin-btn admin-btn-success",
          disabled: loading,
          title: "Đồng bộ categories thành menus",
        },
        AdminPageActions.createAddAction(handleAdd, "Thêm menu"),
      ]}
    />
  );

  if (loading) {
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

  if (error && menus.length === 0) {
    return (
      <PageWrapper actions={pageActions}>
        <div className="alert alert-danger">Error: {error}</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper actions={pageActions}>
      <div className="admin-menu-management">
        <div className="card">
          <div className="card-body">
            <div className="menu-tree">
              {menus.length > 0 ? (
                renderMenuTree(menus)
              ) : (
                <div className="text-center p-4 text-muted">
                  <i className="fas fa-sitemap fa-3x mb-3"></i>
                  <p>
                    Chưa có menu nào. Hãy thêm menu mới hoặc đồng bộ từ
                    categories.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal with MenuForm */}
        <FormModal
          show={showModal}
          onClose={handleCloseModal}
          title={editMode ? "Chỉnh sửa menu" : "Thêm menu mới"}
          size="xl"
          showActions={true}
          onSubmit={handleSubmit}
          submitText={submitting ? "Đang xử lý..." : (editMode ? "Cập nhật" : "Thêm mới")}
          cancelText="Hủy"
          loading={submitting}
        >
          <div className="admin-menu-form p-4">
              {/* Basic Information */}
              <div className="form-section mb-4">
                <h6 className="section-title mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  Thông tin cơ bản
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Tiêu đề (Tiếng Việt){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.titleVi}
                        onChange={(e) =>
                          setFormData({ ...formData, titleVi: e.target.value })
                        }
                        required
                        placeholder="Nhập tiêu đề tiếng Việt"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Tiêu đề (English) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.titleEn}
                        onChange={(e) =>
                          setFormData({ ...formData, titleEn: e.target.value })
                        }
                        required
                        placeholder="Enter English title"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Information */}
              <div className="form-section mb-4">
                <h6 className="section-title mb-3">
                  <i className="fas fa-link me-2"></i>
                  Đường dẫn URL
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        URL (Tiếng Việt) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        placeholder="/trang-chu"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">URL (English)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.urlEn}
                        onChange={(e) =>
                          setFormData({ ...formData, urlEn: e.target.value })
                        }
                        placeholder="/en/home"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Structure & Settings */}
              <div className="form-section mb-4">
                <h6 className="section-title mb-3">
                  <i className="fas fa-sitemap me-2"></i>
                  Cấu trúc & Cài đặt
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Parent Menu</label>
                      <select
                        className="form-control"
                        value={formData.parentId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentId: e.target.value || null,
                          })
                        }
                      >
                        <option value="">-- Root Level --</option>
                        {flattenMenusForSelect(menus)
                          .filter((menu) => menu.id !== editingMenu?.id)
                          .map((menu) => (
                            <option key={menu.id} value={menu.id}>
                              {"—".repeat(menu.level)}{" "}
                              {menu.titleVi || menu.labelVi}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Thứ tự</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">
                        Key <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.key}
                        onChange={(e) =>
                          setFormData({ ...formData, key: e.target.value })
                        }
                        placeholder="home, products, about-us"
                        required
                      />
                      <small className="text-muted">
                        Định danh duy nhất cho menu
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-section mb-4">
                <h6 className="section-title mb-3">
                  <i className="fas fa-align-left me-2"></i>
                  Mô tả (tùy chọn)
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mô tả (Tiếng Việt)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.descriptionVi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descriptionVi: e.target.value,
                          })
                        }
                        placeholder="Mô tả menu bằng tiếng Việt"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mô tả (English)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.descriptionEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descriptionEn: e.target.value,
                          })
                        }
                        placeholder="Description in English"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="form-section mb-4">
                <h6 className="section-title mb-3">
                  <i className="fas fa-cog me-2"></i>
                  Tùy chọn nâng cao
                </h6>
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Trạng thái</label>
                      <div className="form-check-container p-3 border rounded">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isActive: e.target.checked,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isActive"
                          >
                            Hoạt động
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Loại liên kết</label>
                      <div className="form-check-container p-3 border rounded">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isExternal"
                            checked={formData.isExternal}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isExternal: e.target.checked,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isExternal"
                          >
                            Link bên ngoài
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Cách mở link</label>
                      <select
                        className="form-control"
                        value={formData.target}
                        onChange={(e) =>
                          setFormData({ ...formData, target: e.target.value })
                        }
                      >
                        <option value="_self">Cùng cửa sổ</option>
                        <option value="_blank">Cửa sổ mới</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

          </div>
        </FormModal>

        <ToastMessage
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />

        <style>{`
          .admin-menu-form .section-title {
            color: #374151;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }

          .admin-menu-form .form-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
          }

          .admin-menu-form .form-check-container {
            background: white;
            transition: all 0.2s ease;
          }

          .admin-menu-form .form-check-container:hover {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .admin-menu-form .form-control:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .admin-menu-form .form-label {
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
          }
        `}</style>
      </div>
    </PageWrapper>
  );
};

export default MenuManagement;
