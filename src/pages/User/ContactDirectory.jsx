import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./UserDashboard.css";
import "./ContactDirectory.css";

const ContactDirectory = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [expandedOrgs, setExpandedOrgs] = useState({});
  const [expandedDepts, setExpandedDepts] = useState({});

  // Load phone book data from active endpoint
  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/phonebook/active");

      if (response.data?.status === 1) {
        // Transform data to match component format
        const transformedContacts = response.data.data.map((item) => ({
          id: item.id,
          name: item.fullName,
          position: item.position,
          organization: item.organization,
          department: item.department,
          phone: item.phone,
          mobile: item.mobile,
          email: item.email,
          extension: item.extension,
        }));

        setContacts(transformedContacts);
        setFilteredContacts(transformedContacts);

        // Extract unique departments
        const uniqueDepartments = [
          ...new Set(transformedContacts.map((c) => c.department)),
        ].filter(Boolean);
        setDepartments(uniqueDepartments);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
    document.title = "Danh bạ điện thoại";
  }, []);

  // Organization display order
  const ORGANIZATIONS = [
    "Cục Hàng không Việt Nam",
    "Tổng Công ty Quản lý bay Việt Nam",
    "Công ty TNHH Kỹ thuật Quản lý bay",
  ];

  // Group contacts by organization and department
  const groupedContacts = React.useMemo(() => {
    let filtered = contacts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone?.includes(searchTerm) ||
          contact.extension?.includes(searchTerm)
      );
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(
        (contact) => contact.department === selectedDepartment
      );
    }

    // Group by organization first, then by department
    const grouped = {};
    filtered.forEach((contact) => {
      const org = contact.organization || "Chưa phân loại";
      const dept = contact.department || "Chưa có phòng ban";

      if (!grouped[org]) {
        grouped[org] = {};
      }
      if (!grouped[org][dept]) {
        grouped[org][dept] = [];
      }
      grouped[org][dept].push(contact);
    });

    // Sort organizations according to ORGANIZATIONS order
    const sortedGrouped = {};

    // First add organizations in priority order
    ORGANIZATIONS.forEach((orgName) => {
      if (grouped[orgName]) {
        sortedGrouped[orgName] = grouped[orgName];
      }
    });

    // Then add any remaining organizations alphabetically
    Object.keys(grouped)
      .filter((org) => !ORGANIZATIONS.includes(org))
      .sort()
      .forEach((org) => {
        sortedGrouped[org] = grouped[org];
      });

    return sortedGrouped;
  }, [contacts, searchTerm, selectedDepartment]);

  const handleCall = (phone) => {
    // Remove spaces and special characters except + and numbers
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const link = document.createElement('a');
    link.href = `tel:${cleanPhone}`;
    link.click();
  };

  const toggleOrganization = (org) => {
    setExpandedOrgs((prev) => ({
      ...prev,
      [org]: !prev[org],
    }));
  };

  const toggleDepartment = (orgDeptKey) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [orgDeptKey]: !prev[orgDeptKey],
    }));
  };

  return (
    <>
      <div className="internal-page-header mb-4">
        <p className="contact-title">Danh bạ điện thoại</p>
      </div>

      <div className="contact-directory">
        {/* Search and Filter */}
        <div className="directory-controls">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="search-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên, chức vụ, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Directory Content - Tree View */}
        {loading ? (
          <div className="loading-spinner text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải danh bạ...</p>
          </div>
        ) : Object.keys(groupedContacts).length > 0 ? (
          <div className="directory-tree">
            {Object.entries(groupedContacts).map(
              ([organization, departments]) => (
                <div key={organization} className="organization-group">
                  <div
                    className="organization-header clickable"
                    onClick={() => toggleOrganization(organization)}
                  >
                    <i
                      className={`bi ${
                        expandedOrgs[organization]
                          ? "bi-chevron-down"
                          : "bi-chevron-right"
                      }`}
                    ></i>
                    <i className="bi bi-building-fill"></i>
                    <h4>{organization}</h4>
                    <span className="total-count">
                      (
                      {Object.values(departments).reduce(
                        (sum, contacts) => sum + contacts.length,
                        0
                      )}
                      )
                    </span>
                  </div>

                  {expandedOrgs[organization] &&
                    Object.entries(departments).map(
                      ([department, contacts]) => {
                        const orgDeptKey = `${organization}-${department}`;
                        return (
                          <div key={department} className="department-group">
                            <div
                              className="department-header clickable"
                              onClick={() => toggleDepartment(orgDeptKey)}
                            >
                              <i
                                className={`bi ${
                                  expandedDepts[orgDeptKey]
                                    ? "bi-chevron-down"
                                    : "bi-chevron-right"
                                }`}
                              ></i>
                              <i className="bi bi-people-fill"></i>
                              <h5>{department}</h5>
                              <span className="contact-count">
                                ({contacts.length})
                              </span>
                            </div>

                            {expandedDepts[orgDeptKey] && (
                              <div className="contacts-list">
                                {contacts.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="contact-item-tree"
                                  >
                                    <div className="contact-main-info">
                                      <div className="contact-name-pos">
                                        <strong className="contact-name">
                                          {contact.name}
                                        </strong>
                                        <span className="contact-position">
                                          {contact.position}
                                        </span>
                                      </div>

                                      <div className="contact-details-simple">
                                        {contact.phone &&
                                          contact.phone.trim() && (
                                            <div className="contact-detail-inline">
                                              <i className="bi bi-telephone"></i>
                                              <span>
                                                <strong>Điện thoại:</strong>{" "}
                                                {contact.phone}
                                              </span>
                                            </div>
                                          )}
                                        {contact.extension &&
                                          contact.extension.trim() && (
                                            <div className="contact-detail-inline">
                                              <i className="bi bi-hash"></i>
                                              <span>
                                                <strong>Máy lẻ:</strong>{" "}
                                                {contact.extension}
                                              </span>
                                            </div>
                                          )}
                                        {contact.mobile &&
                                          contact.mobile.trim() && (
                                            <div className="contact-detail-inline">
                                              <i className="bi bi-phone"></i>
                                              <span>
                                                <strong>Di động:</strong>{" "}
                                                {contact.mobile}
                                              </span>
                                            </div>
                                          )}
                                        {contact.email &&
                                          contact.email.trim() && (
                                            <div className="contact-detail-inline">
                                              <i className="bi bi-envelope"></i>
                                              <span>
                                                <strong>Email:</strong>{" "}
                                                {contact.email}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    </div>

                                    <div className="contact-actions">
                                      {/* Prioritize mobile number, fallback to phone */}
                                      {(contact.mobile?.trim() || contact.phone?.trim()) && (
                                        <button
                                          className="btn btn-sm btn-outline-success contact-btn-call"
                                          onClick={() =>
                                            handleCall(contact.mobile?.trim() || contact.phone)
                                          }
                                          title={`Gọi ${contact.mobile?.trim() ? `Di động: ${contact.mobile}` : `Điện thoại: ${contact.phone}`}`}
                                        >
                                          <i className={`bi ${contact.mobile?.trim() ? 'bi-phone' : 'bi-telephone'}`}></i>
                                          <span className="btn-text">
                                            {contact.mobile?.trim() ? 'Di động' : 'Gọi'}
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="empty-state text-center py-5">
            <i className="bi bi-person-x text-muted fs-1"></i>
            <h4 className="mt-3 text-muted">Không tìm thấy</h4>
            <p className="text-muted">
              Không có liên hệ nào phù hợp với tìm kiếm
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ContactDirectory;
