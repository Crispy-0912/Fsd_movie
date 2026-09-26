import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current auth status on app start
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await API.get('/users/profile');
          if (res.data && res.data.success && res.data.user) {
            const normalizedUser = {
              ...res.data.user,
              id: res.data.user.id || res.data.user._id
            };
            setUser(normalizedUser);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
          }
        } catch (err) {
          // Only invalidate session if server explicitly returned 401 unauthorized
          if (err.response && err.response.status === 401) {
            console.warn('Session expired or invalid token:', err.message);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          } else {
            console.warn('Backend server connecting / warming up:', err.message);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', { 
        email: email.trim(), 
        password 
      });
      const { token: receivedToken, user: rawUser } = res.data;
      const receivedUser = {
        ...rawUser,
        id: rawUser.id || rawUser._id
      };

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (name, email, password, confirmPassword, role = 'user') => {
    setError(null);
    try {
      const res = await API.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role
      });
      const { token: receivedToken, user: rawUser } = res.data;
      const receivedUser = {
        ...rawUser,
        id: rawUser.id || rawUser._id
      };

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check input.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update profile handler
  const updateProfile = async (updateData) => {
    setError(null);
    try {
      const res = await API.put('/users/profile', updateData);
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
