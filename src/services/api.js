import axios from 'axios';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: allows cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token from localStorage if available
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

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);




// Auth API calls
export const authAPI = {
  // Signup (create new user)
  signup: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/users/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/users/reset-password/${token}`, { newPassword });
    return response.data;
  },
};

// User API calls
export const userAPI = {
  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Contact API calls
export const contactAPI = {
  // Send contact support message
  sendMessage: async (contactData) => {
    const response = await api.post('/contact', contactData, {
      timeout: 30000, // 30-second timeout
    });
    return response.data;
  },
};

export default api;
