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
  news: '/news',
  newsById: (id) => `/news/news/${id}`,
  usersProfile: (id) => `/users/${id}/profile`,
  files: {
    upload: '/files/upload',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
};

export const registerUser = async (userData) => {
  const response = await api.post(endpoints.auth.register, userData);
  return response.data;
};

export default api;
