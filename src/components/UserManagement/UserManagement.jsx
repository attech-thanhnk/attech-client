import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'permissions'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Initialize mock data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Mock roles
      setRoles([
        { id: 1, name: 'Super Admin', description: 'Full system access', color: '#dc3545' },
        { id: 2, name: 'Admin', description: 'Administrative access', color: '#fd7e14' },
        { id: 3, name: 'Editor', description: 'Content management', color: '#6f42c1' },
        { id: 4, name: 'Author', description: 'Content creation', color: '#0d6efd' },
        { id: 5, name: 'Viewer', description: 'Read-only access', color: '#6c757d' }
      ]);

      // Mock permissions
      setPermissions([
        { id: 1, name: 'users.create', description: 'Create users' },
        { id: 2, name: 'users.read', description: 'View users' },
        { id: 3, name: 'users.update', description: 'Edit users' },
        { id: 4, name: 'users.delete', description: 'Delete users' },
        { id: 5, name: 'news.create', description: 'Create news' },
        { id: 6, name: 'news.read', description: 'View news' },
        { id: 7, name: 'news.update', description: 'Edit news' },
        { id: 8, name: 'news.delete', description: 'Delete news' },
        { id: 9, name: 'dashboard.view', description: 'View dashboard' },
        { id: 10, name: 'settings.manage', description: 'Manage settings' }
      ]);

      // Mock users
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          fullName: 'System Administrator',
          avatar: 'https://via.placeholder.com/40',
          roleId: 1,
          status: 'active',
          lastLogin: new Date('2024-01-20T10:30:00'),
          createdAt: new Date('2023-01-01'),
          permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        {
          id: 2,
          username: 'editor',
          email: 'editor@example.com',
          fullName: 'Content Editor',
          avatar: 'https://via.placeholder.com/40',
          roleId: 3,
          status: 'active',
          lastLogin: new Date('2024-01-19T15:45:00'),
          createdAt: new Date('2023-06-15'),
          permissions: [5, 6, 7, 9]
        },
        {
          id: 3,
          username: 'author',
          email: 'author@example.com',
          fullName: 'Content Author',
          avatar: 'https://via.placeholder.com/40',
          roleId: 4,
          status: 'active',
          lastLogin: new Date('2024-01-18T09:20:00'),
          createdAt: new Date('2023-08-20'),
          permissions: [5, 6, 9]
        },
        {
          id: 4,
          username: 'viewer',
          email: 'viewer@example.com',
          fullName: 'System Viewer',
          avatar: 'https://via.placeholder.com/40',
          roleId: 5,
          status: 'inactive',
          lastLogin: new Date('2024-01-10T14:15:00'),
          createdAt: new Date('2023-12-01'),
          permissions: [2, 6, 9]
        },
        {
          id: 5,
          username: 'moderator',
          email: 'moderator@example.com',
          fullName: 'Content Moderator',
          avatar: 'https://via.placeholder.com/40',
          roleId: 2,
          status: 'active',
          lastLogin: new Date('2024-01-21T11:30:00'),
          createdAt: new Date('2023-09-10'),
          permissions: [2, 3, 6, 7, 9]
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Get role by ID
  const getRoleById = (roleId) => {
    return roles.find(role => role.id === roleId) || { name: 'Unknown', color: '#6c757d' };
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.roleId === parseInt(filterRole);
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle user operations
  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser({
      username: '',
      email: '',
      fullName: '',
      roleId: 5,
      status: 'active',
      permissions: []
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  const handleManagePermissions = (user) => {
    setModalMode('permissions');
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleSaveUser = () => {
    if (modalMode === 'create') {
      const newUser = {
        ...selectedUser,
        id: Date.now(),
        avatar: 'https://via.placeholder.com/40',
        lastLogin: null,
        createdAt: new Date()
      };
      setUsers(prev => [...prev, newUser]);
    } else {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
    }
    setShowModal(false);
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  // Modal component
  const UserModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="user-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {modalMode === 'create' && '👤 Create New User'}
              {modalMode === 'edit' && '✏️ Edit User'}
              {modalMode === 'permissions' && '🔐 Manage Permissions'}
            </h3>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            {modalMode !== 'permissions' ? (
              <div className="user-form">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={selectedUser?.username || ''}
                    onChange={e => setSelectedUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={selectedUser?.email || ''}
                    onChange={e => setSelectedUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={selectedUser?.fullName || ''}
                    onChange={e => setSelectedUser(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={selectedUser?.roleId || ''}
                      onChange={e => setSelectedUser(prev => ({ ...prev, roleId: parseInt(e.target.value) }))}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={selectedUser?.status || 'active'}
                      onChange={e => setSelectedUser(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="permissions-form">
                <div className="permissions-header">
                  <h4>User: {selectedUser?.fullName}</h4>
                  <p>Role: {getRoleById(selectedUser?.roleId).name}</p>
                </div>
                
                <div className="permissions-list">
                  {permissions.map(permission => (
                    <div key={permission.id} className="permission-item">
                      <label className="permission-label">
                        <input
                          type="checkbox"
                          checked={selectedUser?.permissions?.includes(permission.id) || false}
                          onChange={e => {
                            const newPermissions = e.target.checked
                              ? [...(selectedUser?.permissions || []), permission.id]
                              : (selectedUser?.permissions || []).filter(id => id !== permission.id);
                            setSelectedUser(prev => ({ ...prev, permissions: newPermissions }));
                          }}
                        />
                        <span className="checkmark"></span>
                        <div className="permission-info">
                          <strong>{permission.name}</strong>
                          <span>{permission.description}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button className="btn secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn primary" onClick={handleSaveUser}>
              {modalMode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="header-content">
          <h2>👥 User Management</h2>
          <p>Manage users, roles, and permissions</p>
        </div>
        <button className="btn primary" onClick={handleCreateUser}>
          <i className="bi bi-person-plus"></i>
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => {
              const role = getRoleById(user.roleId);
              return (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <img src={user.avatar} alt={user.fullName} className="user-avatar" />
                      <div className="user-details">
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="username">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: role.color }}
                    >
                      {role.name}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${user.status}`}
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      <span className="status-dot"></span>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    {user.lastLogin ? (
                      <div className="date-info">
                        <div>{user.lastLogin.toLocaleDateString()}</div>
                        <div className="time">{user.lastLogin.toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="never">Never</span>
                    )}
                  </td>
                  <td>
                    <div className="date-info">
                      <div>{user.createdAt.toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="action-btn permissions"
                        onClick={() => handleManagePermissions(user)}
                        title="Manage Permissions"
                      >
                        <i className="bi bi-shield-lock"></i>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No users found</h3>
            <p>No users match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* User Modal */}
      <UserModal />

      {/* Statistics */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-number">{roles.length}</div>
            <div className="stat-label">User Roles</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <div className="stat-number">{permissions.length}</div>
            <div className="stat-label">Permissions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;