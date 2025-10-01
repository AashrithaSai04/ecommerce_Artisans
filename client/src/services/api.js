import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Special handling for 401 Unauthorized
      // e.g., logout user, redirect to login
      console.error('Unauthorized access - redirecting to login');
      // Add logic to logout user and redirect
    }
    return Promise.reject(error);
  }
);

// ===============================================
// API Service Functions
// ===============================================

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => api.post('/products', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Users / Artisans
export const getArtisans = () => api.get('/users/artisans');
export const getArtisan = (id) => api.get(`/users/artisans/${id}`);

// Orders
export const getMyOrders = () => api.get('/orders/myorders');
export const getSellerOrders = () => api.get('/orders/seller');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}`, { status });

export { api };