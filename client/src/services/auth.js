import api from './api';

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    await api.get('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user details
  updateDetails: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;