import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PageWrapper from "../components/PageWrapper";
import FormModal from "../components/FormModal";
import ToastMessage from "../components/ToastMessage";
import AccessDenied from "../../components/AccessDenied";
import "../styles/adminTable.css";
import "../styles/adminCommon.css";
import "../styles/adminButtons.css";
import "./ContactList.css";

import videoService from "../../services/videoService";
import VideoCreationForm from "../components/VideoCreationForm";

const VideosList = () => {
  const { user: currentUser, ROLES } = useAuth();

  // Data state
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Server-side pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Video preview modal
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const [searchDebounce, setSearchDebounce] = useState("");

  // Load videos
  const loadVideos = useCallback(
    async (searchFilters = {}) => {
      try {
        setLoading(true);
        const queryParams = {
          page: searchFilters.page || currentPage,
          pageNumber: searchFilters.page || currentPage,
          pageSize: searchFilters.limit || itemsPerPage,
          limit: searchFilters.limit || itemsPerPage,
          search:
            searchFilters.search !== undefined
              ? searchFilters.search
              : searchDebounce || "",
          status:
            searchFilters.status !== undefined
              ? searchFilters.status
              : filters.status,
        };
        const response = await videoService.fetchVideos(queryParams);

        if (response.success) {
          let videosData = Array.isArray(response.data) ? response.data : [];

          // Update pagination info from server response
          setTotalItems(response.total || 0);

          // Use pageSize from response if available, otherwise fallback to local state
          const actualPageSize = response.pageSize || itemsPerPage;
          setTotalPages(Math.ceil((response.total || 0) / actualPageSize));

          setVideos(videosData);
        } else {
          setVideos([]);
          setTotalItems(0);
          setTotalPages(0);
          showToast("Lỗi tải danh sách video", "error");
        }
      } catch (error) {
        setVideos([]);
        setTotalItems(0);
        setTotalPages(0);
        showToast("Lỗi kết nối server", "error");
      } finally {
        setLoading(false);
      }
    },
    [searchDebounce, filters.status, currentPage, itemsPerPage]
  );

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchDebounce, filters.status]);

  // Load videos when dependencies change
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleCreate = () => {
    setEditMode(false);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = async (item) => {
    setEditMode(true);
    setEditingItem(item);
    setShowModal(true);
  };

  const handlePreview = (video) => {
    setSelectedVideo(video);
    setShowVideoPreview(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa video "${item.titleVi}"?`)) {
      return;
    }

    try {
      const response = await videoService.deleteVideo(item.id);
      if (response.success) {
        showToast("Xóa video thành công", "success");
        loadVideos();
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      showToast("Lỗi xóa video", "error");
    }
  };

  // Page Actions
  const pageActions = (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        className="admin-btn admin-btn-outline-secondary"
        onClick={loadVideos}
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
        title="Làm mới danh sách"
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
        Thêm Video
      </button>
    </div>
  );

  // Check permission
  if (!currentUser || currentUser.roleId > ROLES.EDITOR) {
    return (
      <PageWrapper>
        <AccessDenied
          message="Bạn không có quyền truy cập trang này."
          user={currentUser}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper actions={pageActions}>
      <div className="admin-contact-list">
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
                )}{" "}
                Tìm kiếm
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tiêu đề video..."
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                }}
              />
            </div>
            <div className="filter-group">
              <label>
                <i className="fas fa-flag"></i> Trạng thái
              </label>
              <select
                className="form-control"
                value={filters.status}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                }}
              >
                <option value="">Tất cả</option>
                <option value="1">Hiển thị</option>
                <option value="0">Ẩn</option>
              </select>
            </div>
            <div className="filter-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setFilters({ search: "", status: "" });
                }}
                title="Xóa bộ lọc"
              >
                <i className="fas fa-eraser"></i>
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-5">
              <i className="fab fa-youtube fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Chưa có video nào</h5>
              <p className="text-muted">
                Nhấn "Thêm Video" để thêm video đầu tiên
              </p>
            </div>
          ) : (
            <>
              <div className="video-gallery" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                padding: "1rem 0"
              }}>
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="video-card"
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #e9ecef",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="video-thumbnail"
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        aspectRatio: "16/9",
                        overflow: "hidden",
                        backgroundColor: "#000"
                      }}
                      onClick={() => handlePreview(video)}
                    >
                      <img
                        src={video.thumbnail || videoService.getYoutubeThumbnail(video.youtubeId)}
                        alt={video.titleVi}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          e.target.src = videoService.getYoutubeThumbnail(video.youtubeId, 'hqdefault');
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "50px",
                        height: "50px",
                        background: "rgba(255,0,0,0.9)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s ease"
                      }}>
                        <i className="fa fa-play" style={{ color: "#fff", fontSize: "18px", marginLeft: "3px" }}></i>
                      </div>
                      {/* Status badge */}
                      <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px"
                      }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: video.status === 1 ? "#d4edda" : "#f8d7da",
                          color: video.status === 1 ? "#155724" : "#721c24"
                        }}>
                          {video.status === 1 ? "Hiển thị" : "Ẩn"}
                        </span>
                      </div>
                      {/* Order badge */}
                      <div style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px"
                      }}>
                        #{video.order || 0}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "1rem" }}>
                      <h6 style={{
                        margin: "0 0 4px 0",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#333",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {video.titleVi || "Chưa có tiêu đề"}
                      </h6>
                      {video.titleEn && (
                        <p style={{
                          margin: "0 0 8px 0",
                          fontSize: "13px",
                          color: "#666",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {video.titleEn}
                        </p>
                      )}
                      <p style={{
                        margin: "0",
                        fontSize: "12px",
                        color: "#999"
                      }}>
                        <i className="fab fa-youtube" style={{ marginRight: "4px" }}></i>
                        {video.youtubeId}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                      padding: "0.75rem 1rem",
                      borderTop: "1px solid #e9ecef",
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end"
                    }}>
                      <button
                        className="admin-btn admin-btn-xs admin-btn-outline-info"
                        onClick={() => handlePreview(video)}
                        title="Xem video"
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          borderRadius: "4px",
                          border: "1px solid #17a2b8",
                          background: "transparent",
                          color: "#17a2b8",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                      <button
                        className="admin-btn admin-btn-xs admin-btn-outline-primary"
                        onClick={() => handleEdit(video)}
                        title="Chỉnh sửa"
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          borderRadius: "4px",
                          border: "1px solid #3b82f6",
                          background: "transparent",
                          color: "#3b82f6",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="admin-btn admin-btn-xs admin-btn-outline-danger"
                        onClick={() => handleDelete(video)}
                        title="Xóa"
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          borderRadius: "4px",
                          border: "1px solid #dc3545",
                          background: "transparent",
                          color: "#dc3545",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrapper" style={{ marginTop: "1.5rem" }}>
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div className="text-center text-muted" style={{ fontSize: "14px", marginTop: "0.5rem" }}>
                    Tổng: {totalItems} video
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        <FormModal
          show={showModal}
          onClose={() => setShowModal(false)}
          title={editMode ? "Chỉnh sửa Video" : "Thêm Video Mới"}
          size="lg"
          showActions={false}
        >
          <VideoCreationForm
            editingVideo={editMode ? editingItem : null}
            onSuccess={() => {
              showToast(
                editMode ? "Cập nhật video thành công" : "Tạo video thành công",
                "success"
              );
              setShowModal(false);
              setEditingItem(null);
              setEditMode(false);
              loadVideos();
            }}
            onCancel={() => setShowModal(false)}
          />
        </FormModal>

        {/* Video Preview Modal */}
        <FormModal
          show={showVideoPreview}
          onClose={() => setShowVideoPreview(false)}
          title={selectedVideo?.titleVi || "Xem Video"}
          size="xl"
          showActions={false}
        >
          {selectedVideo && (
            <div>
              <div style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: "8px"
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.titleVi}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none"
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              {selectedVideo.descriptionVi && (
                <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px" }}>
                  <p style={{ margin: 0, color: "#666" }}>{selectedVideo.descriptionVi}</p>
                </div>
              )}
            </div>
          )}
        </FormModal>

        <ToastMessage
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    </PageWrapper>
  );
};

export default VideosList;
