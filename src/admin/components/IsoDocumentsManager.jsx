import React, { useState, useEffect, useCallback } from "react";
import isoDocumentService from "../../services/isoDocumentService";
import IsoDocumentCreationForm from "./IsoDocumentCreationForm";
import FormModal from "./FormModal";
import { getApiUrl } from "../../config/apiConfig";

const IsoDocumentsManager = ({ onSuccess }) => {
  const [isoDocuments, setIsoDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Load ISO documents
  const loadIsoDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await isoDocumentService.fetchIsoDocuments({
        pageSize: 100,
        sortBy: "displayOrder",
        sortDirection: "asc",
      });

      if (result.success) {
        setIsoDocuments(result.data.items || []);
      } else {
        showMessage("Không thể tải danh sách chứng chỉ ISO", "error");
      }
    } catch (error) {
      showMessage("Có lỗi xảy ra khi tải danh sách", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIsoDocuments();
  }, [loadIsoDocuments]);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Handle create
  const handleCreate = () => {
    setEditMode(false);
    setEditingDocument(null);
    setShowFormModal(true);
  };

  // Handle edit
  const handleEdit = async (document) => {
    try {
      const result = await isoDocumentService.getIsoDocumentById(document.id);
      if (result.success) {
        setEditMode(true);
        setEditingDocument(result.data);
        setShowFormModal(true);
      } else {
        showMessage("Không thể tải chi tiết chứng chỉ", "error");
      }
    } catch (error) {
      showMessage("Có lỗi xảy ra", "error");
    }
  };

  // Handle delete
  const handleDelete = async (document) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${document.titleVi}"?`)) {
      return;
    }

    try {
      const result = await isoDocumentService.deleteIsoDocument(document.id);
      if (result.success) {
        showMessage("Xóa thành công", "success");
        loadIsoDocuments();
      } else {
        showMessage("Không thể xóa chứng chỉ", "error");
      }
    } catch (error) {
      showMessage("Có lỗi xảy ra", "error");
    }
  };

  // Handle download
  const handleDownload = async (document) => {
    if (!document.attachments || document.attachments.length === 0) {
      showMessage("Không có file đính kèm", "warning");
      return;
    }

    try {
      const firstAttachment = document.attachments[0];
      await isoDocumentService.downloadIsoDocument(
        firstAttachment.id,
        firstAttachment.originalFileName
      );
      showMessage("Tải file thành công", "success");
    } catch (error) {
      showMessage("Có lỗi xảy ra khi tải file", "error");
    }
  };

  // Handle form success
  const handleFormSuccess = (data, action) => {
    setShowFormModal(false);
    setEditMode(false);
    setEditingDocument(null);

    const msg = action === "create" ? "Tạo thành công" : "Cập nhật thành công";
    showMessage(msg, "success");
    loadIsoDocuments();
    onSuccess?.();
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowFormModal(false);
    setEditMode(false);
    setEditingDocument(null);
  };

  return (
    <div className="iso-documents-manager">
      {/* Message Alert */}
      {message.text && (
        <div
          className={`alert alert-${
            message.type === "error"
              ? "danger"
              : message.type === "success"
              ? "success"
              : message.type === "warning"
              ? "warning"
              : "info"
          } alert-dismissible fade show`}
          role="alert"
        >
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ text: "", type: "" })}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Quản lý File Chứng chỉ ISO</h5>
          <p className="text-muted small mb-0">
            Tổng số: {isoDocuments.length} chứng chỉ
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleCreate}
          disabled={loading}
        >
          <i className="fas fa-plus me-1"></i>
          Thêm chứng chỉ
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Đang tải danh sách...</p>
        </div>
      )}

      {/* Table */}
      {!loading && isoDocuments.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover table-sm">
            <thead className="table-light">
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "30%" }}>Tiêu đề</th>
                <th style={{ width: "10%" }}>Năm cấp</th>
                <th style={{ width: "15%" }}>Ngày hết hạn</th>
                <th style={{ width: "10%" }}>Files</th>
                <th style={{ width: "10%" }}>Trạng thái</th>
                <th style={{ width: "20%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isoDocuments.map((doc, index) => (
                <tr key={doc.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div>
                      <strong className="d-block">{doc.titleVi}</strong>
                      {doc.titleEn && (
                        <small className="text-muted">{doc.titleEn}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {doc.certificateYear}
                    </span>
                  </td>
                  <td>
                    {doc.expiryDate && doc.expiryDate !== "0001-01-01T00:00:00" ? (
                      <span
                        className={
                          new Date(doc.expiryDate) < new Date()
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {new Date(doc.expiryDate).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {doc.attachments ? doc.attachments.length : 0}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        doc.status === 1 ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {doc.status === 1 ? "Hoạt động" : "Ẩn"}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleEdit(doc)}
                        title="Sửa"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-success"
                        onClick={() => handleDownload(doc)}
                        title="Tải xuống"
                        disabled={
                          !doc.attachments || doc.attachments.length === 0
                        }
                      >
                        <i className="bi bi-download"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(doc)}
                        title="Xóa"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && isoDocuments.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-certificate fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">Chưa có chứng chỉ ISO nào</h5>
          <p className="text-muted">
            Nhấn nút "Thêm chứng chỉ" để bắt đầu quản lý file chứng chỉ ISO
          </p>
          <button className="btn btn-primary mt-2" onClick={handleCreate}>
            <i className="fas fa-plus me-1"></i>
            Thêm chứng chỉ đầu tiên
          </button>
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        show={showFormModal}
        title={editMode ? "Chỉnh sửa chứng chỉ ISO" : "Thêm chứng chỉ ISO"}
        onClose={handleFormCancel}
        size="lg"
        showActions={false}
      >
        <IsoDocumentCreationForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          editMode={editMode}
          editData={editingDocument}
        />
      </FormModal>
    </div>
  );
};

export default IsoDocumentsManager;
