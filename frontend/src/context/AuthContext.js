import React, { createContext, useContext, useState, useEffect } from 'react';
import api from "../../src/utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('asl_user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (username, password) => {
    const res = await api.post('/auth/admin/login', { username, password });
    localStorage.setItem('asl_token', res.data.token);
    localStorage.setItem('asl_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const loginMember = async (email, password) => {
    const res = await api.post('/auth/member/login', { email, password });
    localStorage.setItem('asl_token', res.data.token);
    localStorage.setItem('asl_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('asl_token');
    localStorage.removeItem('asl_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginMember, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
