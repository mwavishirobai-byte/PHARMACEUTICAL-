import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: { fullName: string; phone: string; email: string; password: string; address?: string }) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gfp_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const isStaff = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'staff' || user?.role === 'super_admin';

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('gfp_auth_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Session check failed, clearing token:', err);
      localStorage.removeItem('gfp_auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.login(email, password);
    localStorage.setItem('gfp_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (data: { fullName: string; phone: string; email: string; password: string; address?: string }): Promise<AuthResponse> => {
    const res = await api.register(data);
    localStorage.setItem('gfp_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    void api.logout().catch((err) => {
      console.warn('Server logout request failed; clearing local session anyway:', err);
    }).finally(() => {
      localStorage.removeItem('gfp_auth_token');
      setToken(null);
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isStaff,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
