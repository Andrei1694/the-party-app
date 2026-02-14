/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { endpoints } from '../requests';

const AuthContext = createContext(null);
const TOKEN_KEY = 'auth_token';

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          setUser(null);
          return;
        }
        setAuthToken(token);
        const { data } = await api.get(endpoints.auth.me);
        setUser(data);
      } catch {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMe();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post(endpoints.auth.login, credentials);
    setUser(data.user);
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthToken(data.token);
    }
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post(endpoints.auth.register, payload);
    setUser(data.user);
    return data;
  }, []);

  const updateProfile = useCallback(async (profilePayload) => {
    if (!user?.id) {
      throw new Error('No authenticated user.');
    }
    const { data } = await api.put(endpoints.usersProfile(user.id), profilePayload);
    setUser(data);
    return data;
  }, [user?.id]);

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, isLoading, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
