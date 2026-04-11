import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getInternalDocuments } from "../../services/internalDocumentService";
import { getApiUrl } from "../../config/apiConfig";
import "./UserDashboard.css";

// Map category slug → tên hiển thị
const CATEGORY_LABELS = {
    "to-chuc-bo-may": "Tổ chức bộ máy",
    "quan-ly-hanh-chinh": "Quản lý hành chính",
    "quan-ly-nhan-su": "Quản lý nhân sự",
    "quan-ly-tai-chinh": "Quản lý tài chính",
    "quan-ly-ky-thuat": "Quản lý kỹ thuật & KHCN",
    "van-ban-cong-ty": "Văn bản Công ty",
    "van-ban-nhan-su": "Văn bản về nhân sự",
    "van-ban-cong-doan": "Văn bản công đoàn",
    "tu-dien-nang-luc": "Từ điển năng lực",
    "so-tay-nhan-vien": "Sổ tay nhân viên",
    "van-ban-chk-va-bo-xay-dung": "Văn bản CHK và Bộ Xây dựng",
    "he-thong-dinh-muc": "Hệ thống định mức",
    "van-ban-cac-don-vi-khac": "Văn bản các đơn vị khác",
};

const GlobalDocumentSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const initialKeyword = searchParams.get("q") || "";

    const [inputValue, setInputValue] = useState(initialKeyword);
    const [keyword, setKeyword] = useState(initialKeyword);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const itemsPerPage = 10;

    const fetchDocs = useCallback(async (kw, page) => {
        if (!kw || !kw.trim()) return;
        setLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const result = await getInternalDocuments({
                search: kw.trim(),
                page,
                limit: itemsPerPage,
            });
            if (result.success) {
                setDocs(result.documents || []);
                setTotalItems(result.total || 0);
                setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
                setCurrentPage(page);
            } else {
                setError(result.message || "Có lỗi xảy ra khi tìm kiếm");
                setDocs([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tìm kiếm");
            setDocs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Tìm kiếm khi keyword từ URL thay đổi
    useEffect(() => {
        const q = searchParams.get("q") || "";
        setInputValue(q);
        setKeyword(q);
        setCurrentPage(1);
        if (q.trim()) {
            fetchDocs(q, 1);
            document.title = `Tìm kiếm: ${q}`;
        } else {
            setDocs([]);
            setHasSearched(false);
            document.title = "Tra cứu văn bản";
        }
    }, [searchParams, fetchDocs]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setSearchParams({ q: inputValue.trim() });
    };

    const handlePageChange = (page) => {
        fetchDocs(keyword, page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getCategoryLabel = (categorySlug) => {
        return CATEGORY_LABELS[categorySlug] || categorySlug || "Chưa phân loại";
    };

    return (
        <div className="internal-documents-content">
            <div className="user-dashboard-header">
                <div className="user-header-content">
                    <div className="user-header-left">
                        <h1>
                            <i className="bi bi-search me-3 text-primary"></i>
                            Tra cứu văn bản
                        </h1>
                        {hasSearched && (
                            <span className="badge bg-info fs-6 px-3 py-2 ms-3">
                                {totalItems} kết quả
                            </span>
                        )}
                    </div>
                    <div className="user-header-right">
                        <form onSubmit={handleSearch}>
                            <div className="d-flex gap-2 align-items-center">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập từ khóa tìm kiếm..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ maxWidth: "320px", width: "100%" }}
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-search me-1"></i>
                                    Tìm kiếm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="documents-container">
                {/* Chưa tìm kiếm */}
                {!hasSearched && !loading && (
                    <div className="text-center py-5">
                        <i className="bi bi-search text-muted" style={{ fontSize: "3rem" }}></i>
                        <h4 className="mt-3 text-muted">Tra cứu toàn bộ văn bản</h4>
                        <p className="text-muted">
                            Nhập từ khóa để tìm kiếm trong tất cả các lĩnh vực văn bản
                        </p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="loading-spinner text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tìm kiếm...</p>
                    </div>
                )}

                {/* Lỗi */}
                {error && !loading && (
                    <div className="error-message text-center py-5">
                        <p className="mt-3 text-danger">{error}</p>
                        <button
                            className="btn btn-outline-primary btn-sm mt-2"
                            onClick={() => fetchDocs(keyword, currentPage)}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Kết quả */}
                {!loading && !error && hasSearched && (
                    <>
                        <div className="recent-documents">
                            <div className="section-header">
                                <h3>
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    Kết quả cho &ldquo;{keyword}&rdquo;
                                </h3>
                                {totalPages > 0 && (
                                    <small className="text-muted">
                                        Trang {currentPage} / {totalPages} • {totalItems} văn bản
                                    </small>
                                )}
                            </div>

                            {docs.length > 0 ? (
                                <>
                                    <div className="documents-list">
                                        {docs.map((doc) => {
                                            const hasAttachments = doc.attachments && doc.attachments.length > 0;
                                            const firstAttachment = hasAttachments ? doc.attachments[0] : null;
                                            const hasSingleAttachment = hasAttachments && doc.attachments.length === 1;

                                            return (
                                            <div
                                                key={doc.id}
                                                className={`document-item${hasSingleAttachment ? " is-clickable" : ""}`}
                                                role={hasSingleAttachment ? "button" : undefined}
                                                tabIndex={hasSingleAttachment ? 0 : undefined}
                                                onClick={() => {
                                                    if (hasSingleAttachment) {
                                                        window.open(
                                                            getApiUrl(firstAttachment.url),
                                                            "_blank",
                                                            "noopener,noreferrer"
                                                        );
                                                    }
                                                }}
                                                onKeyDown={(event) => {
                                                    if (!hasSingleAttachment) return;
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        window.open(
                                                            getApiUrl(firstAttachment.url),
                                                            "_blank",
                                                            "noopener,noreferrer"
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="doc-icon">
                                                    <i
                                                        className={`bi ${getDocumentIcon(
                                                            firstAttachment?.contentType
                                                        )} fs-1`}
                                                    ></i>
                                                </div>
                                                <div className="doc-info">
                                                    <h5>{doc.title}</h5>
                                                    {doc.category && (
                                                        <span
                                                            className="badge bg-primary bg-opacity-10 text-primary mb-1"
                                                            style={{ fontSize: "0.75rem", fontWeight: 500 }}
                                                        >
                                                            <i className="bi bi-folder me-1"></i>
                                                            {getCategoryLabel(doc.category)}
                                                        </span>
                                                    )}
                                                    <p className="mb-0">{doc.description || "Không có mô tả"}</p>
                                                    <div className="d-flex align-items-center gap-3 mt-2">
                                                        <small className="text-muted">
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {doc.timePosted
                                                                ? new Date(doc.timePosted).toLocaleDateString("vi-VN")
                                                                : new Date(doc.createdDate).toLocaleDateString("vi-VN")}
                                                        </small>
                                                        {hasAttachments && (
                                                            <small className="text-muted">
                                                                <i className="bi bi-paperclip me-1"></i>
                                                                {doc.attachments.length} file{doc.attachments.length > 1 ? 's' : ''}
                                                            </small>
                                                        )}
                                                        <span className={`badge ${doc.expiryStatus === 0 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                            {doc.expiryStatus === 0 ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                                                        </span>
                                                    </div>

                                                    {/* Display all attachments */}
                                                    {hasAttachments && (
                                                        <div className="mt-3">
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {doc.attachments.map((attachment, idx) => (
                                                                    <a
                                                                        key={attachment.id || idx}
                                                                        href={getApiUrl(attachment.url)}
                                                                        download={attachment.originalFileName}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-outline-primary btn-sm"
                                                                        style={{ border: "1px solid" }}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                        title={`${attachment.originalFileName} (${formatFileSize(attachment.fileSize)})`}
                                                                    >
                                                                        <i className="bi bi-download me-1"></i>
                                                                        {attachment.originalFileName.length > 30
                                                                            ? attachment.originalFileName.substring(0, 30) + '...'
                                                                            : attachment.originalFileName}
                                                                        <small className="ms-2 text-muted">
                                                                            ({formatFileSize(attachment.fileSize)})
                                                                        </small>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                        })}
                                    </div>

                                    {/* Phân trang */}
                                    {totalPages > 1 && (
                                        <nav className="d-flex justify-content-center mt-4">
                                            <ul className="pagination pagination-sm">
                                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <i className="bi bi-chevron-left"></i>
                                                    </button>
                                                </li>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <li
                                                        key={page}
                                                        className={`page-item ${currentPage === page ? "active" : ""}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
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
                                        Không có văn bản nào phù hợp với từ khóa &ldquo;{keyword}&rdquo;
                                    </p>
                                    <p className="text-muted small">
                                        Thử tìm kiếm với từ khóa khác hoặc xem theo danh mục ở menu bên trái
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

export default GlobalDocumentSearch;
