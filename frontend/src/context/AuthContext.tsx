import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthState } from '../types';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../utils/auth';
import { API_BASE_URL } from '../utils/constants';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    access_token: getAccessToken(),
    refresh_token: getRefreshToken(),
    isAuthenticated: false,
    loading: true,
  });

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      const data = await res.json();
      if (data.success && data.data?.access) {
        setTokens(data.data.access, refreshToken);
        setState(prev => ({ ...prev, access_token: data.data.access }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const fetchMe = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setState(prev => ({ ...prev, user: data.data, isAuthenticated: true, loading: false }));
      } else {
        clearTokens();
        setState(prev => ({ ...prev, user: null, isAuthenticated: false, loading: false, access_token: null, refresh_token: null }));
      }
    } catch {
      clearTokens();
      setState(prev => ({ ...prev, user: null, isAuthenticated: false, loading: false }));
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      if (isTokenExpired(accessToken)) {
        const ok = await refreshAccessToken();
        if (!ok) {
          clearTokens();
          setState(prev => ({ ...prev, loading: false, isAuthenticated: false }));
          return;
        }
        const newToken = getAccessToken();
        if (newToken) await fetchMe(newToken);
      } else {
        await fetchMe(accessToken);
      }
    };
    init();
  }, [fetchMe, refreshAccessToken]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setTokens(data.data.access_token, data.data.refresh_token);
        setState(prev => ({
          ...prev,
          user: data.data.user,
          access_token: data.data.access_token,
          refresh_token: data.data.refresh_token,
          isAuthenticated: true,
        }));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (data.success) return { success: true, message: data.message };
      return { success: false, message: data.message || 'Registration failed' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();
    if (refreshToken && accessToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch { /* ignore */ }
    }
    clearTokens();
    setState({ user: null, access_token: null, refresh_token: null, isAuthenticated: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
