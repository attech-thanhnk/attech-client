import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PageWrapper from "../components/PageWrapper";
import FormModal from "../components/FormModal";
import ToastMessage from "../components/ToastMessage";
import AccessDenied from "../../components/AccessDenied";
import DataTable from "../components/DataTable";
// Use consistent styling with other admin pages
import "../styles/adminTable.css";
import "../styles/adminCommon.css";
import "../styles/adminButtons.css";
import "./DocumentsList.css";
import "./ContactList.css";

import documentService from "../../services/documentService";
import DocumentCreationForm from "../components/DocumentCreationForm";
import { getApiUrl } from "../../config/apiConfig";

const DocumentsList = () => {
  const { user: currentUser, ROLES } = useAuth();

  // Track initial load
  const isInitialMount = useRef(true);

  // Data state
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Server-side pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Document detail modal
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    isOutstanding: "",
  });
  const [searchDebounce, setSearchDebounce] = useState("");

  // Debounce search - đợi user gõ xong
  useEffect(() => {
    if (filters.search !== searchDebounce) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, searchDebounce]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const loadDocuments = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        keyword: searchDebounce || "",
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        isOutstanding: filters.isOutstanding,
        sortBy: sortConfig.key,
        sortDirection: sortConfig.direction,
      };

      const response = await documentService.fetchDocuments(params);

      if (response.success) {
        let documentsData = Array.isArray(response.data.items) ? response.data.items : [];

        // Update pagination info from server response
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(Math.ceil((response.data.totalItems || 0) / itemsPerPage));
        setDocuments(documentsData);
      } else {
        setDocuments([]);
        setTotalItems(0);
        setTotalPages(0);
        showToast("Lỗi tải danh sách tài liệu", "error");
      }
    } catch (error) {
      setDocuments([]);
      setTotalItems(0);
      setTotalPages(0);
      showToast("Lỗi tải danh sách tài liệu: " + error.message, "error");
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [currentPage, itemsPerPage, searchDebounce, filters, sortConfig, showToast]);

  // Load data on mount and when pagination/filters/sorting change
  useEffect(() => {
    const isInitialLoad = isInitialMount.current;
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    loadDocuments(isInitialLoad);
  }, [currentPage, itemsPerPage, searchDebounce, filters.status, filters.dateFrom, filters.dateTo, filters.isOutstanding, sortConfig, loadDocuments]);

  // Handlers
  const handleAdd = () => {
    setEditMode(false);
    setEditingDocument(null);
    setShowModal(true);
  };

  const handleEdit = async (documentItem) => {
    try {
      // Call API to get full document detail
      const response = await documentService.getDocumentById(documentItem.id);

      if (response.success && response.data) {
        setEditMode(true);
        setEditingDocument(response.data);  // Use full detail data
        setShowModal(true);
      } else {
        throw new Error('Failed to load document detail');
      }
    } catch (error) {
      showToast('Lỗi khi tải chi tiết tài liệu: ' + error.message, 'error');
    }
  };

  const handleDelete = async (documentItem) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        const response = await documentService.deleteDocument(documentItem.id);
        if (response.success) {
          await loadDocuments();
          showToast("Xóa tài liệu thành công!", "success");
        } else {
          throw new Error("Delete failed");
        }
      } catch (error) {
        showToast(`Xóa tài liệu thất bại: ${error.message}`, "error");
      }
    }
  };

  const handleFormSuccess = async (savedDocument) => {
    try {
      await loadDocuments();
      
      if (editMode) {
        showToast("Cập nhật tài liệu thành công!", "success");
      } else {
        showToast("Thêm tài liệu thành công!", "success");
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi tải lại dữ liệu", "error");
    }

    setShowModal(false);
    setEditingDocument(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDocument(null);
  };

  const handleViewDocument = async (documentItem) => {
    try {
      // Call API to get full document detail
      const response = await documentService.getDocumentById(documentItem.id);

      if (response.success && response.data) {
        setSelectedDocument(response.data);  // Use full detail data
        setShowDocumentDetail(true);
      } else {
        throw new Error('Failed to load document detail');
      }
    } catch (error) {
      showToast("Lỗi khi xem chi tiết tài liệu: " + error.message, "error");
    }
  };

  const handleDownloadDocument = async (documentItem) => {
    try {
      await documentService.downloadDocument(documentItem.id, documentItem.originalFileName || documentItem.titleVi);
      showToast("Tải xuống thành công!", "success");
    } catch (error) {
      showToast("Lỗi khi tải xuống tài liệu", "error");
    }
  };

  // Use server-side data directly (no client-side filtering/sorting)
  const paginatedDocuments = documents;

  // Table columns - updated for document API response format
  const columns = [
    { key: "id", label: "ID", sortable: true, width: "80px" },
    {
      key: "titleVi",
      label: "Tiêu đề",
      sortable: true,
      width: "250px",
      render: (item) => (
        <div>
          <div className="document-name" title={item.titleVi}>
            {item.titleVi}
          </div>
          <div className="document-title text-muted" style={{ fontSize: "0.85em" }}>
            {item.titleEn || "No English title"}
          </div>
        </div>
      ),
    },
    {
      key: "newsCategoryTitleVi", 
      label: "Danh mục",
      width: "150px",
      render: (item) => (
        <span className="category-badge">
          {item.newsCategoryTitleVi || "Chưa phân loại"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      width: "120px",
      render: (item) => (
        <span
          className={`badge ${
            item.status === 1 ? "badge-success" : 
            item.status === 0 ? "badge-secondary" : "badge-warning"
          }`}
        >
          {item.status === 1 ? "Hoạt động" : 
           item.status === 0 ? "Không hoạt động" : "Không xác định"}
        </span>
      ),
    },
    {
      key: "timePosted",
      label: "Ngày đăng",
      sortable: true,
      width: "140px",
      render: (item) => item.timePosted ? new Date(item.timePosted).toLocaleDateString("vi-VN") : "Chưa đăng",
    },
  ];

  const actions = [
    {
      label: "Xem",
      onClick: handleViewDocument,
      className: "admin-btn admin-btn-xs admin-btn-info",
      icon: "bi bi-eye",
    },
    {
      label: "Tải xuống",
      onClick: handleDownloadDocument,
      className: "admin-btn admin-btn-xs admin-btn-success",
      icon: "bi bi-download",
    },
    {
      label: "Sửa",
      onClick: handleEdit,
      className: "admin-btn admin-btn-xs admin-btn-primary",
      icon: "bi bi-pencil",
    },
    {
      label: "Xóa",
      onClick: handleDelete,
      className: "admin-btn admin-btn-xs admin-btn-danger",
      icon: "bi bi-trash",
    },
  ];

  // Page Actions for the sticky action bar
  const pageActions = (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        className="admin-btn admin-btn-outline-secondary"
        onClick={loadDocuments}
        disabled={loading}
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
        title="Làm mới danh sách tài liệu"
      >
        <i className="fas fa-refresh"></i>
        Làm mới
      </button>
      <button
        className="admin-btn admin-btn-primary"
        onClick={handleAdd}
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
        <i className="fas fa-plus"></i>
        Thêm tài liệu
      </button>
    </div>
  );

  // Check permissions
  if (!currentUser || currentUser.roleId > ROLES.EDITOR) {
    return <AccessDenied />;
  }

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

  return (
    <PageWrapper actions={pageActions}>
      <div className="admin-documents-list">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-title">
            <i className="fas fa-filter"></i>
            Bộ lọc & Tìm kiếm
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>
                {isSearching ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-search"></i>
                )} Tìm kiếm
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên file hoặc tiêu đề..."
                value={filters.search}
                onChange={(e) => {
                  const newSearch = e.target.value;
                  setFilters((prev) => ({ ...prev, search: newSearch }));
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-group">
              <label><i className="fas fa-flag"></i> Trạng thái</label>
              <select
                className="form-control"
                value={filters.status}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option key="all-status" value="">Tất cả trạng thái</option>
                <option key="active" value="1">Hoạt động</option>
                <option key="inactive" value="0">Không hoạt động</option>
              </select>
            </div>
            <div className="filter-group">
              <label><i className="fas fa-calendar"></i> Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.dateFrom}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-group">
              <label><i className="fas fa-calendar"></i> Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.dateTo}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }));
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setFilters({
                    search: "",
                    status: "",
                    dateFrom: "",
                    dateTo: "",
                    isOutstanding: "",
                  });
                  setCurrentPage(1);
                }}
                title="Xóa tất cả bộ lọc"
              >
                <i className="fas fa-eraser"></i>
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-container">
          <DataTable
            data={paginatedDocuments}
            columns={columns}
            actions={actions}
            sortConfig={sortConfig}
            onSort={(key) => {
              setSortConfig((prev) => ({
                key,
                direction:
                  prev.key === key && prev.direction === "desc" ? "asc" : "desc",
              }));
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Modal with DocumentCreationForm */}
        <FormModal
          show={showModal}
          onClose={handleCloseModal}
          title={editMode ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
          size="lg"
          showActions={false}
        >
          <DocumentCreationForm
            editingDocument={editingDocument}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </FormModal>

        {/* Document Detail Modal */}
        <FormModal
          show={showDocumentDetail}
          onClose={() => setShowDocumentDetail(false)}
          title="Chi tiết tài liệu"
          size="md"
          showActions={false}
        >
          {selectedDocument && (
            <div className="document-detail">
              <div className="detail-row">
                <strong>Tiêu đề (VI):</strong> {selectedDocument.titleVi}
              </div>
              <div className="detail-row">
                <strong>Tiêu đề (EN):</strong> {selectedDocument.titleEn || "Chưa có"}
              </div>
              <div className="detail-row">
                <strong>Mô tả (VI):</strong> {selectedDocument.descriptionVi || "Chưa có"}
              </div>
              <div className="detail-row">
                <strong>Mô tả (EN):</strong> {selectedDocument.descriptionEn || "Chưa có"}
              </div>
              <div className="detail-row">
                <strong>Danh mục:</strong> {selectedDocument.newsCategoryNameVi || "Chưa phân loại"}
              </div>
              <div className="detail-row">
                <strong>Trạng thái:</strong> 
                <span className={`badge ${
                  selectedDocument.status === 1 ? "badge-success" : 
                  selectedDocument.status === 0 ? "badge-secondary" : "badge-warning"
                }`}>
                  {selectedDocument.status === 1 ? "Hoạt động" : 
                   selectedDocument.status === 0 ? "Không hoạt động" : "Không xác định"}
                </span>
              </div>
              <div className="detail-row">
                <strong>Ngày đăng:</strong> {selectedDocument.timePosted ? new Date(selectedDocument.timePosted).toLocaleDateString("vi-VN") : "Chưa đăng"}
              </div>
              <div className="detail-row">
                <strong>Files đính kèm:</strong>
                {selectedDocument.documents && selectedDocument.documents.length > 0 ? (
                  <ul>
                    {selectedDocument.documents.map((doc, index) => (
                      <li key={index} style={{marginBottom: '10px'}}>
                        <div><strong>{doc.originalFileName || `File ${index + 1}`}</strong></div>
                        <div>Kích thước: {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'N/A'}</div>
                        {doc.url && (
                          <a 
                            href={getApiUrl(doc.url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{color: '#007bff', textDecoration: 'none'}}
                          >
                            <i className="fas fa-download"></i> Tải xuống
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>Không có file đính kèm</span>
                )}
              </div>
              {selectedDocument.imageUrl && (
                <div className="detail-row">
                  <strong>Ảnh đại diện:</strong>
                  <br/>
                  <img 
                    src={getApiUrl(selectedDocument.imageUrl)} 
                    alt="Featured" 
                    style={{maxWidth: "200px", height: "auto", marginTop: "10px", borderRadius: "8px"}} 
                  />
                </div>
              )}
            </div>
          )}
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

export default DocumentsList;