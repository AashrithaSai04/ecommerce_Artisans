import { api } from './api';

// Artisan Dashboard Services
export const artisanService = {
  // Dashboard
  getDashboard: () => api.get('/artisan/dashboard'),
  
  // Profile Management
  updateProfile: (profileData) => api.put('/artisan/profile', profileData),
  
  // Order Management
  getOrders: (params = {}) => api.get('/artisan/orders', { params }),
  updateOrderStatus: (orderId, statusData) => 
    api.put(`/artisan/orders/${orderId}/status`, statusData),
  
  // Analytics
  getAnalytics: (period = '30d') => 
    api.get('/artisan/analytics', { params: { period } }),
  
  // Reviews
  getReviews: (params = {}) => api.get('/artisan/reviews', { params }),
};

// Customer Services
export const customerService = {
  // Reviews
  createReview: (reviewData) => api.post('/customer/reviews', reviewData),
  getProductReviews: (productId, params = {}) => 
    api.get(`/customer/reviews/product/${productId}`, { params }),
  markReviewHelpful: (reviewId, helpful) => 
    api.post(`/customer/reviews/${reviewId}/helpful`, { helpful }),
  
  // Community
  createCommunityPost: (postData) => api.post('/customer/community/posts', postData),
  getCommunityPosts: (params = {}) => api.get('/customer/community/posts', { params }),
  likeCommunityPost: (postId) => api.post(`/customer/community/posts/${postId}/like`),
  
  // Support
  createSupportTicket: (ticketData) => api.post('/customer/support/tickets', ticketData),
  getSupportTickets: (params = {}) => api.get('/customer/support/tickets', { params }),
};

// Enhanced Product Services
export const productService = {
  // Basic CRUD
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Advanced search and filtering
  searchProducts: (searchParams) => api.get('/products', { params: searchParams }),
  getProductsByCategory: (category) => api.get('/products', { params: { category } }),
  getProductsByLocation: (location) => api.get('/products', { params: { location } }),
  getProductsByCraftSpecialty: (specialty) => 
    api.get('/products', { params: { craftSpecialty: specialty } }),
  
  // Product interactions
  incrementViewCount: (id) => api.post(`/products/${id}/view`),
  addToWishlist: (id) => api.post(`/products/${id}/wishlist`),
  removeFromWishlist: (id) => api.delete(`/products/${id}/wishlist`),
};

// User/Auth Services
export const userService = {
  // Registration and Login
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  
  // Profile Management
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  // Password Management
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => 
    api.put(`/auth/reset-password/${token}`, { password }),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
  
  // Wishlist Management
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
};

// Order Services
export const orderService = {
  // Order Management
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params = {}) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  
  // Order tracking
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  
  // Returns and refunds
  requestReturn: (orderId, returnData) => 
    api.post(`/orders/${orderId}/return`, returnData),
};

// Support Services
export const supportService = {
  // Tickets
  createTicket: (ticketData) => api.post('/customer/support/tickets', ticketData),
  getTickets: (params = {}) => api.get('/customer/support/tickets', { params }),
  getTicket: (id) => api.get(`/customer/support/tickets/${id}`),
  updateTicket: (id, updateData) => api.put(`/customer/support/tickets/${id}`, updateData),
  
  // Messages
  addMessage: (ticketId, message) => 
    api.post(`/customer/support/tickets/${ticketId}/messages`, message),
};

// Community Services
export const communityService = {
  // Posts
  getPosts: (params = {}) => api.get('/customer/community/posts', { params }),
  getPost: (id) => api.get(`/customer/community/posts/${id}`),
  createPost: (postData) => api.post('/customer/community/posts', postData),
  updatePost: (id, postData) => api.put(`/customer/community/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/customer/community/posts/${id}`),
  
  // Interactions
  likePost: (id) => api.post(`/customer/community/posts/${id}/like`),
  addComment: (postId, comment) => 
    api.post(`/customer/community/posts/${postId}/comments`, comment),
  sharePost: (postId, platform) => 
    api.post(`/customer/community/posts/${postId}/share`, { platform }),
};

// Analytics Services (for artisans)
export const analyticsService = {
  getSalesData: (period = '30d') => 
    api.get('/artisan/analytics', { params: { period } }),
  getProductPerformance: (period = '30d') => 
    api.get('/artisan/analytics/products', { params: { period } }),
  getCustomerInsights: () => api.get('/artisan/analytics/customers'),
  getRevenueData: (period = '30d') => 
    api.get('/artisan/analytics/revenue', { params: { period } }),
};

// Location Services
export const locationService = {
  getStates: () => api.get('/location/states'),
  getCities: (stateId) => api.get(`/location/cities/${stateId}`),
  searchLocations: (query) => api.get('/location/search', { params: { q: query } }),
};

// Upload Services
export const uploadService = {
  uploadImage: (file, type = 'product') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultipleImages: (files, type = 'product') => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('type', type);
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDocument: (file, type = 'verification') => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    return api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default {
  artisanService,
  customerService,
  productService,
  userService,
  orderService,
  supportService,
  communityService,
  analyticsService,
  locationService,
  uploadService,
};