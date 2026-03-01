/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { endpoints } from '../requests';

const AuthContext = createContext(null);
const TOKEN_KEY = 'auth_token';

const readStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeStoredToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures and rely on in-memory auth state.
  }
};

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const initialToken = readStoredToken();
setAuthToken(initialToken);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialToken));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const token = readStoredToken();
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthToken(null);
          setIsLoading(false);
          return;
        }

        setAuthToken(token);

        const { data } = await api.get(endpoints.auth.me);
        setUser(data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        writeStoredToken(null);
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
    writeStoredToken(data.token ?? null);
    setAuthToken(data.token ?? null);
    setIsAuthenticated(Boolean(data.token));
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post(endpoints.auth.register, payload);
    setUser(data.user);
    writeStoredToken(data.token ?? null);
    setAuthToken(data.token ?? null);
    setIsAuthenticated(Boolean(data.token));
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
    setIsAuthenticated(false);
    writeStoredToken(null);
    setAuthToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, isLoading, isAuthenticated, login, register, updateProfile, logout],
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
