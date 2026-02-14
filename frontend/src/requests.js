import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const endpoints = {
  users: '/users',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post(endpoints.auth.register, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
