'use client';

import { create } from 'zustand';
import { api } from './api-client';

interface User {
  id: string;
  name: string;
  email: string;
  orgId: string;
  accountType: string;
  role: string;
  org?: {
    id: string;
    name: string;
    type: string;
    accountType: string;
    address?: string;
  };
  [key: string]: unknown;
}

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithPortal: (accountType: string, email: string, password: string) => Promise<void>;
  registerWithPortal: (accountType: string, payload: Record<string, string>) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Navigation
  page: string;
  params: Record<string, string>;
  navigate: (page: string, params?: Record<string, string>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  token: null,
  loading: true,

  loginWithPortal: async (accountType, email, password) => {
    const endpoint = accountType === 'buyer' ? '/auth/buyer/login' : '/auth/seller/login';
    const data = await api.post(endpoint, { email, password });
    set({ user: data.user, token: data.token });
    if (typeof window !== 'undefined') {
      localStorage.setItem('medmkt_token', data.token);
      localStorage.setItem('medmkt_user', JSON.stringify(data.user));
    }
    set({ page: 'dashboard' });
  },

  registerWithPortal: async (accountType, payload) => {
    const endpoint = accountType === 'buyer' ? '/auth/buyer/register' : '/auth/seller/register';
    const body = {
      orgName: payload.orgName,
      orgType: payload.orgType,
      name: payload.name,
      email: payload.email,
      password: payload.password,
    };
    const data = await api.post(endpoint, body);
    set({ user: data.user, token: data.token });
    if (typeof window !== 'undefined') {
      localStorage.setItem('medmkt_token', data.token);
      localStorage.setItem('medmkt_user', JSON.stringify(data.user));
    }
    set({ page: 'dashboard' });
  },

  logout: () => {
    set({ user: null, token: null, page: 'landing', params: {} });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medmkt_token');
      localStorage.removeItem('medmkt_user');
    }
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') {
      set({ loading: false });
      return;
    }
    const token = localStorage.getItem('medmkt_token');
    const userStr = localStorage.getItem('medmkt_user');
    if (token && userStr) {
      try {
        const data = await api.get('/auth/me');
        set({ user: data.user, token, loading: false });
      } catch {
        localStorage.removeItem('medmkt_token');
        localStorage.removeItem('medmkt_user');
        set({ user: null, token: null, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  // Navigation
  page: 'landing',
  params: {},

  navigate: (page, params = {}) => {
    set({ page, params });
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  },
}));
