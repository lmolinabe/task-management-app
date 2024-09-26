import React, { createContext, useState, useEffect } from 'react';
import AppBackendApi from '../apis/BackendApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create an event emitter for token refresh
  const onTokenRefresh = new EventTarget();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const res = await AppBackendApi.get('/api/auth/me', {
          headers: { 'x-auth-token': accessToken },
        });
        setUser(res.data);
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  };

  const signup = async (name, email, password) => {
    try {
      await AppBackendApi.post('/api/auth/signup', { name, email, password });
    } catch (err) {
      return Promise.reject(err.response.data.error || err.response.data.errors);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await AppBackendApi.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      fetchUser();
    } catch (err) {
        return Promise.reject(err.response.data.error || err.response.data.errors);
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await AppBackendApi.post('/api/auth/logout', {}, {
          headers: { 'x-auth-token': accessToken },
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found.');
      }

      const res = await AppBackendApi.post('/api/auth/refresh-token', { refreshToken: refreshToken });
      const newAccessToken = res.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      fetchUser();

      // Emit the 'tokenRefreshed' event
      onTokenRefresh.dispatchEvent(new Event('tokenRefreshed'));

      return newAccessToken; // Return new token for retrying requests
    } catch (error) {
      console.error('Error refreshing access token:', error);
      logout(); // Log the user out if refresh fails
      throw error; // Re-throw to handle in the calling component
    }
  };

  // Modify AppBackendApi to intercept 401 errors and attempt refresh
  AppBackendApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite loop if refresh fails
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if(accessToken && refreshToken)
        {
          try {
            const newAccessToken = await refreshAccessToken();
            originalRequest.headers['x-auth-token'] = newAccessToken;
            return AppBackendApi(originalRequest); // Retry the original request
          } catch (refreshError) {
            return Promise.reject(refreshError); // Propagate error if refresh fails
          }
        }
      }

      return Promise.reject(error); // For other errors, reject the promise
    }
  );

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, fetchUser, loading, onTokenRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};
