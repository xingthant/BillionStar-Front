import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize axios defaults
  useEffect(() => {
    axios.defaults.withCredentials = true;
    
    // Response interceptor for handling auth errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          setUser(null);
          localStorage.removeItem('user');
          setError('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check auth status on app load and set up token refresh
  useEffect(() => {
    checkAuthStatus();
    
    const interval = setInterval(() => {
      if (user) {
        checkAuthStatus(); // Silent token refresh every 30 minutes
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
        console.error('Failed to parse saved user:', e);
      }
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Auth check successful:', response.data);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
    } catch (error) {
      console.error('Auth check failed:', error.response?.status, error.message);
      
      // Handle different error scenarios
      if (error.code === 'ECONNABORTED') {
        setError('Server timeout. Please check your connection.');
      } else if (error.response?.status === 401) {
        // Not logged in - this is expected for unauthorized users
        setUser(null);
        localStorage.removeItem('user');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (!navigator.onLine) {
        setError('No internet connection.');
      } else {
        setError('Authentication check failed. Please try again.');
      }
      
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
      
      return { 
        success: true, 
        data: response.data,
        user: response.data.user 
      };
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid email or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Server not found. Please check your connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection.';
      }
      
      setError(errorMessage);
      setUser(null);
      localStorage.removeItem('user');
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        userData,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
      
      return { 
        success: true, 
        data: response.data,
        user: response.data.user 
      };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid registration data';
      } else if (error.response?.status === 409) {
        errorMessage = 'User already exists with this email';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection.';
      }
      
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, we still clear local state
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuthStatus,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
