import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  demoLogin: (role?: 'USER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('creditbridge_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('creditbridge_token');
      if (savedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          console.error('Session expired:', error);
          localStorage.removeItem('creditbridge_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('creditbridge_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    setLoading(true);
    try {
      const data = await authApi.register(email, password, full_name);
      localStorage.setItem('creditbridge_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'USER' | 'ADMIN' = 'USER') => {
    setLoading(true);
    try {
      const data = await authApi.demoLogin(role);
      localStorage.setItem('creditbridge_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('creditbridge_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
