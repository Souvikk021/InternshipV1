import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { setAccessToken, clearAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session from refresh token cookie on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await authService.refresh();
        const token = res.data?.data?.accessToken;
        if (token) {
          setAccessToken(token);
          const meRes = await authService.me();
          setUser(meRes.data?.data?.user);
        }
      } catch {
        // No valid refresh token — user must log in
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // Listen for token expiry events from interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const { user: u, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email, password) => {
    const res = await authService.register(email, password);
    const { user: u, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAccessToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
