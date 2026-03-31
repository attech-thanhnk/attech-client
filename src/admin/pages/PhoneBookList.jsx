import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPhoneBookEntries,
  deletePhoneBookEntry,
  togglePhoneBookStatus,
  importPhoneBookExcel,
  exportPhoneBookExcel,
  downloadImportTemplate,
} from "../../services/phoneBookService";
import PageWrapper from "../components/PageWrapper";
import AdminTable from "../components/AdminTable";
import ToastMessage from "../components/ToastMessage";
import AccessDenied from "../../components/AccessDenied";
import PhoneBookForm from "../components/PhoneBookForm";
import "../styles/adminTable.css";
import "../styles/adminCommon.css";
import "../styles/adminPageStyles.css";
import "../styles/adminButtons.css";

// Constants
const ORGANIZATIONS = [
  "Cục Hàng không Việt Nam",
  "Tổng Công ty Quản lý bay Việt Nam",
  "Công ty TNHH Kỹ thuật Quản lý bay",
];

const DEPARTMENTS = {
  "Công ty TNHH Kỹ thuật Quản lý bay": [
    "Ban lãnh đạo Công ty",
    "Chi nhánh tại TP HCM",
    "Đội Bay hiệu chuẩn",
    "Phòng Kế hoạch - Kinh doanh",
    "Phòng Kỹ thuật - An toàn - Chất lượng",
    "Phòng Nghiên cứu Phát triển",
    "Phòng Tài chính - Kế toán",
    "Phòng TCCB-LĐ",
    "Trung tâm Huấn luyện - Đào tạo",
    "Văn phòng Công ty",
    "Xí nghiệp Chế tạo Thiết bị hàng không",
    "Trung tâm bảo đảm Kỹ thuật",
    "Ban Quản lý dự án đầu tư và xây dựng chuyên ngành",
  ],
  "Tổng Công ty Quản lý bay Việt Nam": [
    "Tổng Công ty Quản lý bay Việt Nam",
    "Công ty Quản lý bay miền Bắc",
    "Công ty Quản lý bay miền Nam",
    "Công ty Quản lý bay miền Trung",
    "Trung tâm đào tạo Huấn luyện nghiệp vụ Quản lý bay",
    "Trung tâm Phối hợp tìm kiếm cứu nạn Hàng không",
    "Trung tâm Hiệp đồng Điều hành bay",
    "Trung tâm Thông báo tin tức Hàng không",
  ],
  "Cục Hàng không Việt Nam": ["Cục Hàng không Việt Nam"],
};

const PhoneBookList = () => {
  const { t } = useTranslation();
  const { user: currentUser, ROLES } = useAuth();

  // Data state
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchDebounce, setSearchDebounce] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "order",
    direction: "asc",
  });
  const [filters, setFilters] = useState({
    search: "",
  });

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Debounce search
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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (searchDebounce !== filters.search) {
      loadData(false);
    } else {
      loadData(true);
    }
  }, [currentPage, itemsPerPage, searchDebounce, sortConfig]);

  // Load phone book entries
  const loadData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);

      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchDebounce,
          sortBy: sortConfig.key,
          sortDir: sortConfig.direction,
        };

        const result = await getPhoneBookEntries(params);

        if (result.success) {
          setEntries(result.data);
          setTotalItems(result.totalItems);
          setTotalPages(result.totalPages);
        } else {
          showToast(result.message, "error");
          setEntries([]);
        }
      } catch (error) {
        showToast("Có lỗi xảy ra khi tải dữ liệu", "error");
        setEntries([]);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [currentPage, itemsPerPage, searchDebounce, filters, sortConfig]
  );

  // Show toast message
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 5000);
  };

  // Handle create/edit
  const handleCreateEdit = (entry = null) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      return;
    }

    try {
      const result = await deletePhoneBookEntry(id);
      if (result.success) {
        showToast(result.message, "success");
        loadData();
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi xóa", "error");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const result = await togglePhoneBookStatus(id);
      if (result.success) {
        showToast(result.message, "success");
        loadData();
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi thay đổi trạng thái", "error");
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      showToast("Vui lòng chọn file để import", "warning");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(importFile.type)) {
      showToast("Chỉ chấp nhận file Excel (.xlsx, .xls)", "error");
      return;
    }

    // Validate file size (5MB)
    if (importFile.size > 5 * 1024 * 1024) {
      showToast("File quá lớn! Vui lòng chọn file dưới 5MB", "error");
      return;
    }

    setImporting(true);
    try {
      const result = await importPhoneBookExcel(importFile);
      setImportResult(result.data);

      if (result.success) {
        showToast(result.message, "success");
        loadData();
        setImportFile(null);
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi import", "error");
    } finally {
      setImporting(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const result = await exportPhoneBookExcel();
      if (result.success) {
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi export", "error");
    }
  };

  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      const result = await downloadImportTemplate();
      if (result.success) {
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast("Có lỗi xảy ra khi tải mẫu", "error");
    }
  };

  // Handle form save
  const handleFormSave = () => {
    setShowModal(false);
    setSelectedEntry(null);
    loadData();
    showToast(
      selectedEntry ? "Cập nhật thành công" : "Thêm mới thành công",
      "success"
    );
  };

  // Permission check - after all hooks
  if (!currentUser || currentUser.roleId > ROLES.ADMIN) {
    return <AccessDenied />;
  }

  // Table columns - Simple CRUD
  const columns = [
    {
      key: "fullName",
      label: "Họ tên",
      sortable: true,
      width: "20%",
    },
    {
      key: "position",
      label: "Chức danh",
      width: "18%",
    },
    {
      key: "phone",
      label: "Điện thoại",
      width: "15%",
    },
    {
      key: "mobile",
      label: "Di động",
      width: "15%",
    },
    {
      key: "email",
      label: "Email",
      width: "22%",
    },
    {
      key: "isActive",
      label: "Trạng thái",
      width: "10%",
      render: (item) => (
        <span
          className={`badge ${item.isActive ? "bg-success" : "bg-secondary"}`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Page actions - like UserManagement
  const pageActions = (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        className="admin-btn admin-btn-outline-secondary"
        onClick={() => loadData()}
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
        title="Làm mới danh sách"
      >
        <i className="fas fa-refresh"></i>
        Làm mới
      </button>
      <button
        className="admin-btn admin-btn-primary"
        onClick={() => handleCreateEdit()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "1px solid #007bff",
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "500",
          cursor: "pointer",
        }}
        title="Thêm mới danh bạ"
      >
        <i className="fas fa-plus"></i>
        Thêm mới
      </button>
    </div>
  );

  return (
    <PageWrapper
      title="Quản lý Danh bạ Điện thoại"
      breadcrumb={[
        { label: "Dashboard", path: "/admin" },
        { label: "Danh bạ Điện thoại", active: true },
      ]}
      actions={pageActions}
    >
      {/* Simple Search */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên, chức danh, số điện thoại..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        data={entries}
        columns={columns}
        loading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: setItemsPerPage,
        }}
        sorting={{
          sortConfig,
          onSort: setSortConfig,
        }}
        actions={[
          {
            label: "Sửa",
            onClick: (item) => handleCreateEdit(item),
            className: "admin-btn admin-btn-xs admin-btn-info",
          },
          {
            label: "Xóa",
            onClick: (item) => handleDelete(item.id),
            className: "admin-btn admin-btn-xs admin-btn-danger",
          },
        ]}
      />

      {/* Form Modal */}
      {showModal && (
        <PhoneBookForm
          entry={selectedEntry}
          organizations={ORGANIZATIONS}
          departments={DEPARTMENTS}
          onSave={handleFormSave}
          onCancel={() => {
            setShowModal(false);
            setSelectedEntry(null);
          }}
        />
      )}

      {/* Toast */}
      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </PageWrapper>
  );
};

export default PhoneBookList;
