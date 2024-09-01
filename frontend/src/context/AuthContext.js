import React, { createContext, useState, useEffect } from 'react';
import AppBackendApi from '../apis/BackendApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await AppBackendApi.get('/api/auth/me', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await AppBackendApi.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      fetchUser();
    } catch (err) {
      localStorage.removeItem('token');
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await AppBackendApi.post('/api/auth/signup', { name, email, password });
      localStorage.setItem('token', res.data.token);
      fetchUser();
    } catch (err) {
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
