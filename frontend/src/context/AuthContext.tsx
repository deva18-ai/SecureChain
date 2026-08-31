import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, Token, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; full_name: string; password: string; wallet_address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    try {
      const response = await authApi.me();
      setUser(response.data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { access_token, token_type, expires_in } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    await refreshUser();
  };

  const register = async (data: { email: string; full_name: string; password: string; wallet_address?: string }) => {
    const response = await authApi.register(data);
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}