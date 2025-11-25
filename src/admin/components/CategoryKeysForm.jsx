import React, { useState, useEffect, useCallback } from "react";
import {
  fetchLanguageContents,
  createLanguageContent,
  updateLanguageContent,
  deleteLanguageContent
} from "../../services/languageContentService";
import "./CategoryKeysForm.css";

const CategoryKeysForm = ({ content, onSuccess, onCancel }) => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    valueVi: "",
    valueEn: "",
    description: ""
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Extract category prefix from translation key
  // e.g., "frontend.companyInfo.history.fullContent" -> "frontend.companyInfo.history"
  const categoryPrefix = content.translationKey.split('.').slice(0, -1).join('.');

  useEffect(() => {
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const loadKeys = async () => {
    try {
      setLoading(true);
      // Load all keys with pageSize=100 (backend may have max limit)
      // Note: Backend SQL Server doesn't support -1 for pageSize
      // Search for last part of prefix (e.g., "history" or "iso")
      const searchTerm = categoryPrefix.split('.').pop();
      const response = await fetchLanguageContents(1, 100, searchTerm, {}, null);

      // Filter to only include keys that match the exact prefix
      const filteredKeys = (response.items || []).filter(item =>
        item.contentKey && item.contentKey.startsWith(categoryPrefix + '.')
      );

      setKeys(filteredKeys);
    } catch (error) {
      console.error("Error loading keys:", error);
      showToast("Lỗi tải dữ liệu: " + (error.message || "Không xác định"), "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setFormData({
      key: key.contentKey.replace(categoryPrefix + '.', ''), // Remove prefix for editing
      valueVi: key.valueVi || "",
      valueEn: key.valueEn || "",
      description: key.description || ""
    });
    setShowAddForm(true);
  };

  const handleAdd = () => {
    setEditingKey(null);
    setFormData({
      key: "",
      valueVi: "",
      valueEn: "",
      description: ""
    });
    setShowAddForm(true);
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${key.contentKey}"?`)) return;

    try {
      await deleteLanguageContent(key.id);
      showToast("Xóa thành công!", "success");
      loadKeys();
    } catch (error) {
      showToast("Lỗi khi xóa", "error");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Debug log

    try {
      const fullKey = `${categoryPrefix}.${formData.key}`;

      if (editingKey) {
        // Update existing
        await updateLanguageContent(editingKey.id, {
          contentKey: fullKey,
          valueVi: formData.valueVi,
          valueEn: formData.valueEn,
          category: 'frontend',
          description: formData.description
        });
        showToast("Cập nhật thành công!", "success");
      } else {
        // Create new
        await createLanguageContent({
          contentKey: fullKey,
          valueVi: formData.valueVi,
          valueEn: formData.valueEn,
          category: 'frontend',
          description: formData.description
        });
        showToast("Thêm mới thành công!", "success");
      }

      setShowAddForm(false);
      loadKeys();
    } catch (error) {
      showToast("Lỗi khi lưu dữ liệu: " + (error.message || "Không xác định"), "error");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingKey(null);
    setFormData({
      key: "",
      valueVi: "",
      valueEn: "",
      description: ""
    });
  };

  if (loading) {
    return (
      <div className="category-keys-form">
        <div className="loading-state">
          <div className="spinner-border" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-keys-form">
      {/* Toast */}
      {toast.show && (
        <div className={`toast-message toast-${toast.type}`}>
          <i className={`fas fa-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`}></i>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="form-header">
        <div className="header-info">
          <h3>{content.titleVi}</h3>
          <p className="category-prefix">
            <i className="fas fa-tag"></i>
            <code>{categoryPrefix}.*</code>
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={handleAdd}
          disabled={showAddForm}
        >
          <i className="fas fa-plus"></i>
          Thêm key mới
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="add-key-form">
          <h4>{editingKey ? "Chỉnh sửa key" : "Thêm key mới"}</h4>
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Key <span className="text-danger">*</span>
                </label>
                <div className="key-input-group">
                  <span className="key-prefix">{categoryPrefix}.</span>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.key}
                    onChange={(e) => setFormData({...formData, key: e.target.value})}
                    placeholder="milestone1"
                    required
                    disabled={!!editingKey}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tiếng Việt</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.valueVi}
                  onChange={(e) => setFormData({...formData, valueVi: e.target.value})}
                  placeholder="Nhập nội dung tiếng Việt..."
                />
              </div>
              <div className="form-group">
                <label>English</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.valueEn}
                  onChange={(e) => setFormData({...formData, valueEn: e.target.value})}
                  placeholder="Enter English content..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả ngắn gọn về key này"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleCancel}
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-success"
              >
                <i className="fas fa-save"></i>
                {editingKey ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Keys List */}
      <div className="keys-list">
        {keys.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox fa-3x"></i>
            <h4>Chưa có key nào</h4>
            <p>Click "Thêm key mới" để bắt đầu</p>
          </div>
        ) : (
          <div className="keys-table">
            <table>
              <thead>
                <tr>
                  <th style={{width: '25%'}}>Key</th>
                  <th style={{width: '30%'}}>Tiếng Việt</th>
                  <th style={{width: '30%'}}>English</th>
                  <th style={{width: '15%'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td>
                      <code className="key-code">
                        {key.contentKey.replace(categoryPrefix + '.', '')}
                      </code>
                      {key.description && (
                        <div className="key-description">{key.description}</div>
                      )}
                    </td>
                    <td>
                      <div className="value-cell">{key.valueVi || <em className="text-muted">Chưa có</em>}</div>
                    </td>
                    <td>
                      <div className="value-cell">{key.valueEn || <em className="text-muted">Not set</em>}</div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="admin-btn admin-btn-xs admin-btn-primary"
                          onClick={() => handleEdit(key)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="admin-btn admin-btn-xs admin-btn-danger"
                          onClick={() => handleDelete(key)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="form-footer">
        <button
          className="admin-btn admin-btn-secondary"
          onClick={onCancel}
        >
          <i className="fas fa-times"></i>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default CategoryKeysForm;
