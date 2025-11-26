import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInternalDocumentsByCategory } from "../../services/internalDocumentService";
import { getApiUrl } from "../../config/apiConfig";
import "./UserDashboard.css";

const InternalDocuments = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [internalDocs, setInternalDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Mapping category slugs to display names
  const categoryTitles = {
    "to-chuc-bo-may": "Tổ chức bộ máy",
    "quan-ly-hanh-chinh": "Quản lý hành chính",
    "quan-ly-nhan-su": "Quản lý nhân sự",
    "quan-ly-tai-chinh": "Quản lý tài chính",
    "quan-ly-ky-thuat": "Quản lý kỹ thuật & KHCN",
    "van-ban-cong-ty": "Văn bản công ty",
    "van-ban-nhan-su": "Văn bản về nhân sự",
    "van-ban-cong-doan": "Văn bản công đoàn",
    "tu-dien-nang-luc": "Từ điển năng lực",
    "so-tay-nhan-vien": "Sổ tay nhân viên",
    "van-ban-chk-va-bo-xay-dung": "Văn bản CHK và Bộ Xây dựng",
    "he-thong-dinh-muc": "Hệ thống định mức",
    "van-ban-cac-don-vi-khac": "Văn bản các đơn vị khác",
  };

  const fetchDocumentsByCategory = async (
    categorySlug,
    page = 1,
    search = ""
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page,
        limit: itemsPerPage,
        search: search,
      };

      const result = await getInternalDocumentsByCategory(categorySlug, params);
      if (result.success) {
        setInternalDocs(result.documents);
        setTotalItems(result.total);
        setTotalPages(Math.ceil(result.total / itemsPerPage));
        setCurrentPage(page);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải tài liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchDocumentsByCategory(category, 1, searchTerm);
      document.title = `${categoryTitles[category] || "Tài liệu"}`;
    }
  }, [category]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocumentsByCategory(category, 1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchDocumentsByCategory(category, page, searchTerm);
  };

  const categoryTitle = categoryTitles[category] || "Tài liệu nội bộ";

  return (
    <div className="internal-documents-content">
      <div className="user-dashboard-header">
        <div className="user-header-content">
          <div className="user-header-left">
            <h1>
              <i className="bi bi-folder-fill me-3 text-primary"></i>
              {categoryTitle}
            </h1>
            <span className="badge bg-info fs-6 px-3 py-2 ms-3">
              {totalItems} tài liệu
            </span>
          </div>
          <div className="user-header-right">
            <div className="d-flex gap-2 align-items-center">
              <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập từ khóa tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value === "") {
                          setCurrentPage(1);
                          fetchDocumentsByCategory(category, 1, "");
                        }
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                      style={{ width: "300px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSearch}
                    >
                      Tìm kiếm
                    </button>
                  </div>
                </div>
              </div>
      </div>
      <div className="documents-container">
        {loading && (
          <div className="loading-spinner text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải tài liệu...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message text-center py-5">
            <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
            <p className="mt-3 text-danger">{error}</p>
            <button
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={() => fetchDocumentsByCategory(category)}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="recent-documents">
              <div className="section-header">
                <h3>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  "Tài liệu trong danh mục"
                </h3>
                <small className="text-muted">
                  Trang {currentPage} / {totalPages} • {totalItems} tài liệu
                </small>
              </div>

              {internalDocs.length > 0 ? (
                <>
                  <div className="documents-list">
                    {internalDocs.map((doc) => (
                      <div key={doc.id} className="document-item">
                        <div className="doc-icon">
                          <i
                            className={`bi ${getDocumentIcon(
                              doc.attachment?.contentType
                            )} fs-1`}
                          ></i>
                        </div>
                        <div className="doc-info">
                          <h5>{doc.title}</h5>
                          <p>{doc.description || "Không có mô tả"}</p>
                          <div className="d-flex align-items-center gap-3 mt-2">
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {doc.timePosted
                                ? new Date(doc.timePosted).toLocaleDateString("vi-VN")
                                : new Date(doc.createdDate).toLocaleDateString("vi-VN")}
                            </small>
                            {doc.attachment && (
                              <small className="text-muted">
                                <i className="bi bi-file-earmark me-1"></i>
                                {formatFileSize(doc.attachment.fileSize)}
                              </small>
                            )}
                          </div>
                        </div>
                        <div className="doc-actions">
                          {doc.attachment && (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() =>
                                  window.open(
                                    getApiUrl(doc.attachment.url),
                                    "_blank"
                                  )
                                }
                              >
                                <i className="bi bi-eye me-1"></i>
                                Xem
                              </button>
                              <a
                                href={getApiUrl(doc.attachment.url)}
                                download={doc.attachment.originalFileName}
                                className="btn btn-outline-success btn-sm"
                              >
                                <i className="bi bi-download me-1"></i>
                                Tải về
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-4">
                      <ul className="pagination pagination-sm">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                        </li>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}

                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-search text-muted fs-1"></i>
                  <h4 className="mt-3 text-muted">Không tìm thấy kết quả</h4>
                  <p className="text-muted">
                    Không có tài liệu nào phù hợp với từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getDocumentIcon = (mimeType) => {
  if (!mimeType) return "bi-file-earmark-text";

  if (mimeType.includes("pdf")) return "bi-file-earmark-pdf text-danger";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "bi-file-earmark-word text-primary";
  if (mimeType.includes("excel") || mimeType.includes("sheet"))
    return "bi-file-earmark-excel text-success";
  if (mimeType.includes("image")) return "bi-file-earmark-image text-info";

  return "bi-file-earmark-text";
};

const formatFileSize = (bytes) => {
  if (!bytes) return "N/A";
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
};

export default InternalDocuments;
