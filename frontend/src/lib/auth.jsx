import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hm_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('hm_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); localStorage.setItem('hm_user', JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem('hm_token'); localStorage.removeItem('hm_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  // Portal-aware login: hits /api/auth/{buyer|seller}/login.
  const loginWithPortal = useCallback(async (accountType, email, password) => {
    const { data } = await api.post(`/auth/${accountType}/login`, { email, password });
    localStorage.setItem('hm_token', data.token);
    localStorage.setItem('hm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const registerWithPortal = useCallback(async (accountType, payload) => {
    const { data } = await api.post(`/auth/${accountType}/register`, payload);
    localStorage.setItem('hm_token', data.token);
    localStorage.setItem('hm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_user');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, loginWithPortal, registerWithPortal, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
