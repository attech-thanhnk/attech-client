import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

// JWT token utilities
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

// Role-based system with roleId
const ROLES = {
  SUPERADMIN: 1,  // Super Admin - Full access
  ADMIN: 2,       // Admin - Most features
  EDITOR: 3,      // Editor - Limited access
  USER: 4         // User - Basic access
};


// Helper to get initial user from localStorage
const getInitialUser = () => {
  const token = localStorage.getItem('auth_token');
  if (!token || isTokenExpired(token)) {
    return null;
  }

  // Try stored user data first
  const storedUserData = localStorage.getItem('user_data');
  if (storedUserData) {
    try {
      const user = JSON.parse(storedUserData);
      return {
        id: user.id,
        name: user.fullName || user.username,
        email: user.email,
        username: user.username,
        phone: user.phone,
        roleId: user.roleId || 3,
        roleName: user.roleName || 'editor',
        status: user.status || 'active',
        lastLogin: user.lastLogin
      };
    } catch (e) {
      // Fall through to JWT decode
    }
  }

  // Fallback to JWT decode
  const decoded = decodeJWT(token);
  if (decoded) {
    return {
      id: decoded.sub,
      name: decoded.name || decoded.username,
      email: decoded.email,
      username: decoded.username || decoded.name,
      roleId: decoded.roleId || 3,
      roleName: decoded.roleName || 'editor',
      status: 'active'
    };
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage immediately (no waiting for API)
  const [user, setUser] = useState(() => getInitialUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally validate with server in background (don't block UI)
    const validateAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
        return;
      }

      try {
        // Validate token with server to get fresh user data
        const response = await api.get('/api/auth/me');
        
        if (response.data.status === 1 && response.data.data) {
          const userData = response.data.data;
          const freshUserData = {
            id: userData.id,
            name: userData.fullName || userData.username,
            email: userData.email,
            username: userData.username,
            phone: userData.phone,
            roleId: userData.roleId || 3,
            roleName: userData.roleName || 'editor',
            status: userData.status || 'active',
            lastLogin: userData.lastLogin
          };
          // Update with fresh data from server
          setUser(freshUserData);
          // Also update localStorage
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
      } catch (error) {
        // API validation failed - but user is already set from localStorage
        // Only clear if token is truly expired
        if (isTokenExpired(token)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
        // Otherwise keep the user logged in with cached data
      }
    };

    validateAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Try real API call first
      try {
        const loginData = {
          username: credentials.username,
          password: credentials.password
        };

        // Thêm recaptcha token nếu có
        if (credentials.recaptchaToken) {
          loginData.recaptchaToken = credentials.recaptchaToken;
        }

        const response = await api.post('/api/auth/login', loginData);
        
        // Handle API response format: { status: 1, data: { success: true, token: "...", user: {...} } }
        if (response.data.status === 1 && response.data.data && response.data.data.success && response.data.data.token) {
          const { token, user } = response.data.data;
          
          // Store token and user data from backend
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          // Use user data from API response
          const userData = {
            id: user.id,
            name: user.fullName || user.username,
            email: user.email,
            username: user.username,
            phone: user.phone,
            roleId: user.roleId || 3,
            roleName: user.roleName || 'editor',
            status: user.status || 'active',
            lastLogin: user.lastLogin
          };
          
          setUser(userData);
          return { success: true, user: userData };
        } else {
          throw new Error(response.data.message || 'Login failed');
        }
      } catch (apiError) {
        // Check if it's a network error
        if (apiError.code === 'ERR_NETWORK' || apiError.message.includes('Network Error') || apiError.message.includes('ERR_CONNECTION_REFUSED')) {
          throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
        }
        
        // Check if it's a server error (5xx)
        if (apiError.response?.status >= 500) {
          throw new Error('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.');
        }
        
        // Check if it's an authentication error (401)
        if (apiError.response?.status === 401) {
          throw new Error('Tài khoản không tồn tại hoặc sai mật khẩu');
        }
        
        // For other API errors, show the error message
        if (apiError.response?.data?.message || apiError.response?.data?.Message) {
          const errorMsg = apiError.response.data.message || apiError.response.data.Message;
          throw new Error(errorMsg);
        }
        
        // No fallback - only use real API
        throw new Error('Tài khoản không tồn tại hoặc sai mật khẩu');
      }
      
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // Role-based permission checking
  const hasPermission = (requiredRoleId) => {
    if (!user || typeof requiredRoleId !== 'number') {
      return false;
    }
    return user.roleId <= requiredRoleId;
  };

  const isAuthenticated = () => {
    const authenticated = !!user;
    return authenticated;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    ROLES,
    decodeJWT,
    isTokenExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { ROLES };