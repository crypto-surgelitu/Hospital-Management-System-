import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }
    
    if (error.response.status === 401) {
      const isAuthRoute = error.config.url?.includes('/auth/login');
      if (!isAuthRoute && window.location.pathname !== '/login') {
        console.warn('401 on', error.config.url, '- token may be invalid/expired');
      }
    }
    
    if (error.response.status === 403) {
      console.warn('403 Forbidden:', error.response.data?.message);
      if (window.location.pathname !== '/login') {
        window.location.href = '/unauthorized';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;