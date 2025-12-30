import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/auth/status');
        
        if (response.data?.success && response.data.user) {
          setCurrentUser(response.data.user);
          setError(null);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
        // Don't show error for initial auth check to prevent flash of login screen
        if (window.location.pathname !== '/login') {
          setError('Session expired. Please log in again.');
        }
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/login', { 
        email, 
        password 
      });
      
      if (response.data?.success && response.data.user) {
        setCurrentUser(response.data.user);
        setError(null);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data?.success && response.data.user) {
        setCurrentUser(response.data.user);
        setError(null);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
      setError(null);
      navigate('/login');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Check if user is a teacher
  const isTeacher = () => {
    return currentUser?.isTeacher === true;
  };

  const value = {
    currentUser,
    loading: loading || !initialCheckDone,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!currentUser,
    isTeacher,
    setError // Allow error to be set from other components
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
