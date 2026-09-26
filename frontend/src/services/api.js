import axios from 'axios';

const getApiBaseUrl = () => {
  // If explicitly specified in environment
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }

  // If running locally in browser
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000/api';
  }

  // Production Render backend deployment
  return 'https://fsd-movie.onrender.com/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/register')
    ) {
      // Clear token on real 401 unauthorized (expired or invalid token)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default API;
