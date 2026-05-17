// Axios client centralising base URL + bearer token injection
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      // token invalid — clear and let routes redirect
      localStorage.removeItem('hm_token');
      localStorage.removeItem('hm_user');
    }
    return Promise.reject(err);
  }
);

export default api;
