import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hm_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('hm_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); localStorage.setItem('hm_user', JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem('hm_token'); localStorage.removeItem('hm_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hm_token', data.token);
    localStorage.setItem('hm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
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
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
