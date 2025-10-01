import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get(`/users/me`)
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/token', new URLSearchParams({
      username: email,
      password: password,
    }));
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    const decodedToken = jwtDecode(access_token);
    const userResponse = await api.get(`/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
    });
    setUser(userResponse.data);
  };

  const register = async (email, password) => {
    await api.post('/users/', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;