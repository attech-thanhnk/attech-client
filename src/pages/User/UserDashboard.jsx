import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import AccountModal from "../../components/AccountModal";
import "./UserDashboard.css";
import logo from "../../assets/img/logo.png";
import { getInternalDocuments } from "../../services/internalDocumentService";
import { getApiUrl } from "../../config/apiConfig";

// Map category slug → label
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
  "van-ban-chk-va-bo-xay-dung": "Văn bản CHK & Bộ Xây dựng",
  "he-thong-dinh-muc": "Hệ thống định mức",
  "van-ban-cac-don-vi-khac": "Văn bản các đơn vị khác",
};

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const headerSearchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Check if we're on the main dashboard page
  const isDashboardHome = location.pathname === "/trang-noi-bo";

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/", { replace: true });
    }
  };

  // Debounced autocomplete search
  const doSearch = useCallback(async (kw) => {
    if (!kw || kw.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const result = await getInternalDocuments({ search: kw.trim(), page: 1, limit: 8 });
      if (result.success) {
        setSearchResults(result.documents || []);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(true); // vẫn show để hiện "không tìm thấy"
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setHeaderSearchTerm(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setShowDropdown(false);
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  // Mở file khi chọn kết quả
  const handleSelectResult = (doc) => {
    setShowDropdown(false);
    setHeaderSearchTerm("");
    const hasAttachments = doc.attachments && doc.attachments.length > 0;

    if (hasAttachments) {
      // Nếu chỉ có 1 file, mở trực tiếp
      if (doc.attachments.length === 1) {
        window.open(getApiUrl(doc.attachments[0].url), "_blank", "noopener,noreferrer");
      } else {
        // Nếu có nhiều files, chuyển đến trang search để user chọn
        navigate(`/trang-noi-bo/tim-kiem?q=${encodeURIComponent(doc.title)}`);
      }
    }
  };

  // Chuyển đến trang tìm kiếm đầy đủ (Enter hoặc footer dropdown)
  const handleViewAll = () => {
    if (!headerSearchTerm.trim()) return;
    navigate(`/trang-noi-bo/tim-kiem?q=${encodeURIComponent(headerSearchTerm.trim())}`);
    setShowDropdown(false);
    setHeaderSearchTerm("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleViewAll();
  };
  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        headerSearchRef.current &&
        !headerSearchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  useEffect(() => {
    document.title = "Trang nội bộ";
  }, []);

  return (
    <div className="user-dashboard">
      {mobileSidebarVisible && (
        <div
          className="mobile-sidebar-overlay"
          onClick={toggleMobileSidebar}
        ></div>
      )}
      <div className="dashboard-layout">
        <aside className={`dashboard-sidebar ${mobileSidebarVisible ? "show" : ""}`}>
          <div className="sidebar-header" onClick={() => navigate("/trang-noi-bo")} >
            <img className="logo-trang-noi-bo" src={logo} alt="Logo" />
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <h4>Dashboard</h4>
              <ul className="nav-list">
                <li className={`nav-item ${isDashboardHome ? "active" : ""}`}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo");
                    }}
                  >
                    <i className="bi bi-speedometer2"></i>
                    <span>Trang chủ</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <h4>Văn bản quản lý nội bộ</h4>
              <ul className="nav-list">
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/to-chuc-bo-may");
                    }}
                  >
                    <i className="bi bi-diagram-3"></i>
                    <span>Tổ chức bộ máy</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/quan-ly-hanh-chinh");
                    }}
                  >
                    <i className="bi bi-building"></i>
                    <span>Quản lý hành chính</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/quan-ly-nhan-su");
                    }}
                  >
                    <i className="bi bi-people"></i>
                    <span>Quản lý nhân sự</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/quan-ly-tai-chinh");
                    }}
                  >
                    <i className="bi bi-cash-stack"></i>
                    <span>Quản lý tài chính</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/quan-ly-ky-thuat");
                    }}
                  >
                    <i className="bi bi-gear-wide-connected"></i>
                    <span>Quản lý kỹ thuật &amp; KHCN</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <h4>Văn bản quản lý điều hành</h4>
              <ul className="nav-list">
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/van-ban-cong-ty");
                    }}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Văn bản Công ty</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/van-ban-nhan-su");
                    }}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Văn bản về nhân sự</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/van-ban-chk-va-bo-xay-dung");
                    }}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Văn bản CHK và Bộ Xây dựng </span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/he-thong-dinh-muc");
                    }}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Hệ thống định mức</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/van-ban-cac-don-vi-khac");
                    }}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Văn bản các đơn vị khác</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <h4>Văn bản công đoàn</h4>
              <ul className="nav-list">
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/van-ban-cong-doan");
                    }}
                  >
                    <i className="bi bi-people-fill"></i>
                    <span>Văn bản công đoàn</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <h4>Tài liệu hỗ trợ</h4>
              <ul className="nav-list">
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/danh-ba");
                    }}
                  >
                    <i className="bi bi-telephone-fill"></i>
                    <span>Danh bạ điện thoại</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/trang-noi-bo/so-tay-nhan-vien");
                    }}
                  >
                    <i className="bi bi-journal-bookmark"></i>
                    <span>Sổ tay nhân viên</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-header">
            <div className="header-left">
              <button
                className="header-btn mobile-menu-btn"
                onClick={toggleMobileSidebar}
                title="Toggle menu"
              >
                <i className="bi bi-list"></i>
              </button>
              <button
                className="header-btn home-btn"
                onClick={() => navigate("/")}
                title="Về trang chủ website"
              >
                <i className="bi bi-house"></i>
                <span>Trang chủ</span>
              </button>
              {/* Thanh tìm kiếm tự động toàn cục */}
              <form className="header-global-search" onSubmit={handleSearchSubmit}>
                <div className="header-search-wrapper">
                  <i className="bi bi-search header-search-icon"></i>
                  <input
                    ref={headerSearchRef}
                    type="text"
                    className="header-search-input"
                    placeholder="Tìm kiếm văn bản..."
                    value={headerSearchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (headerSearchTerm.trim().length >= 2) setShowDropdown(true);
                    }}
                    autoComplete="off"
                  />
                  {searchLoading && (
                    <span className="header-search-spinner">
                      <span className="spinner-border spinner-border-sm text-primary" role="status" />
                    </span>
                  )}
                </div>
                <button type="submit" className="header-search-btn">
                  Tra cứu
                </button>

                {/* Dropdown kết quả */}
                {showDropdown && (
                  <div className="search-dropdown" ref={dropdownRef}>
                    {searchResults.length > 0 ? (
                      <>
                        <ul className="search-dropdown-list">
                          {searchResults.map((doc) => {
                            const hasAttachments = doc.attachments && doc.attachments.length > 0;
                            return (
                            <li
                              key={doc.id}
                              className="search-dropdown-item"
                              onMouseDown={() => handleSelectResult(doc)}
                            >

                              <span className="search-item-body">
                                <span className="search-item-title">{doc.title}</span>
                                <span className="search-item-meta">
                                  {doc.category && (
                                    <span className="search-item-category">
                                      {CATEGORY_LABELS[doc.category] || doc.category}
                                    </span>
                                  )}
                                  {hasAttachments && (
                                    <span className="search-item-category" style={{background: '#e0f2fe', color: '#0284c7'}}>
                                      <i className="bi bi-paperclip"></i> {doc.attachments.length} file{doc.attachments.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  <span className={`badge ${doc.expiryStatus === 0 ? 'bg-success' : 'bg-warning text-dark'}`} style={{fontSize: '0.7rem', padding: '2px 6px'}}>
                                    {doc.expiryStatus === 0 ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                                  </span>
                                </span>
                                {doc.description && (
                                  <span className="search-item-desc">{doc.description}</span>
                                )}
                              </span>
                              {hasAttachments && (
                                <span className="search-item-action">
                                  <i className="bi bi-box-arrow-up-right"></i>
                                </span>
                              )}
                            </li>
                            );
                          })}
                        </ul>
                        <div className="search-dropdown-footer" onMouseDown={handleViewAll}>
                          <i className="bi bi-list-ul me-1"></i>
                          Xem tất cả kết quả cho &ldquo;{headerSearchTerm}&rdquo;
                          <i className="bi bi-arrow-right ms-1"></i>
                        </div>
                      </>
                    ) : (
                      !searchLoading && (
                        <div className="search-dropdown-empty">
                          <i className="bi bi-search me-2 text-muted"></i>
                          Không tìm thấy văn bản nào
                        </div>
                      )
                    )}
                  </div>
                )}
              </form>
            </div>
            <div className="header-user">
              <div className="user-info">
                <i className="bi bi-person-circle"></i>
                <div className="user-details">
                  <span className="user-name">
                    {user?.name || user?.username}
                  </span>
                </div>
              </div>
              <div className="user-actions">
                <button
                  className="header-btn account-btn"
                  onClick={() => setShowAccountModal(true)}
                  title="Quản lý tài khoản"
                >
                  <i className="bi bi-person-gear"></i>
                  <span>Tài khoản</span>
                </button>
                <button
                  className="header-btn logout-btn"
                  onClick={handleLogout}
                  title="Đăng xuất khỏi hệ thống"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </header>
          <main className="dashboard-content">
            {isDashboardHome ? (
              // Simple intro content with quick access
              <div className="simple-welcome">
                <div className="welcome-content">
                  <h1>Trang thông tin nội bộ</h1>
                  <p>Chào mừng bạn đến với hệ thống quản lý thông tin nội bộ</p>
                </div>

                <div className="quick-access-sections">
                  {/* Văn bản quản lý nội bộ */}
                  <div className="quick-section">
                    <h3 className="quick-section-title">
                      <i className="bi bi-folder2-open"></i>
                      Văn bản quản lý nội bộ
                    </h3>
                    <div className="quick-section-grid">
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/to-chuc-bo-may")}>
                        <i className="bi bi-diagram-3"></i>
                        <span>Tổ chức bộ máy</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/quan-ly-hanh-chinh")}>
                        <i className="bi bi-building"></i>
                        <span>Quản lý hành chính</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/quan-ly-nhan-su")}>
                        <i className="bi bi-people"></i>
                        <span>Quản lý nhân sự</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/quan-ly-tai-chinh")}>
                        <i className="bi bi-cash-stack"></i>
                        <span>Quản lý tài chính</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/quan-ly-ky-thuat")}>
                        <i className="bi bi-gear-wide-connected"></i>
                        <span>Quản lý kỹ thuật &amp; KHCN</span>
                      </button>
                    </div>
                  </div>

                  {/* Văn bản quản lý điều hành */}
                  <div className="quick-section">
                    <h3 className="quick-section-title">
                      <i className="bi bi-file-earmark-ruled"></i>
                      Văn bản quản lý điều hành
                    </h3>
                    <div className="quick-section-grid">
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/van-ban-cong-ty")}>
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Văn bản Công ty</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/van-ban-nhan-su")}>
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Văn bản về nhân sự</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/van-ban-chk-va-bo-xay-dung")}>
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Văn bản CHK và Bộ Xây dựng</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/he-thong-dinh-muc")}>
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Hệ thống định mức</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/van-ban-cac-don-vi-khac")}>
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Văn bản các đơn vị khác</span>
                      </button>
                    </div>
                  </div>

                  {/* Văn bản công đoàn */}
                  <div className="quick-section">
                    <h3 className="quick-section-title">
                      <i className="bi bi-people-fill"></i>
                      Văn bản công đoàn
                    </h3>
                    <div className="quick-section-grid">
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/van-ban-cong-doan")}>
                        <i className="bi bi-people-fill"></i>
                        <span>Văn bản công đoàn</span>
                      </button>
                    </div>
                  </div>

                  {/* Tài liệu hỗ trợ */}
                  <div className="quick-section">
                    <h3 className="quick-section-title">
                      <i className="bi bi-journal-bookmark"></i>
                      Tài liệu hỗ trợ
                    </h3>
                    <div className="quick-section-grid">
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/danh-ba")}>
                        <i className="bi bi-telephone-fill"></i>
                        <span>Danh bạ điện thoại</span>
                      </button>
                      <button className="quick-btn" onClick={() => navigate("/trang-noi-bo/so-tay-nhan-vien")}>
                        <i className="bi bi-journal-bookmark"></i>
                        <span>Sổ tay nhân viên</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Show nested route content
              <Outlet />
            )}
          </main>
        </div>
      </div>

      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
};

export default UserDashboard;

// Helper: icon theo loại file
function getFileIcon(mimeType) {
  if (!mimeType) return "bi-file-earmark-text text-secondary";
  if (mimeType.includes("pdf")) return "bi-file-earmark-pdf text-danger";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "bi-file-earmark-word text-primary";
  if (mimeType.includes("excel") || mimeType.includes("sheet"))
    return "bi-file-earmark-excel text-success";
  if (mimeType.includes("image")) return "bi-file-earmark-image text-info";
  return "bi-file-earmark-text text-secondary";
}
