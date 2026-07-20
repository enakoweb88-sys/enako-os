import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, AuthUser, clearSession, getStoredUser, RoleName, storeSession } from './api';

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string, role: RoleName) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const handleUnload = () => {
      const sessionId = localStorage.getItem('enako_session_id');
      if (sessionId) {
        const defaultHost = window.location.hostname.replace(/^(www\.|app\.|os\.|client\.|dashboard\.)/, '');
        const url = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'https://api.enakoos.com/api/v1' : `https://api.${defaultHost}/api/v1`);
        navigator.sendBeacon(`${url}/auth/end-session`, new Blob([JSON.stringify({ sessionId })], { type: 'application/json' }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password, role) {
      const session = await api.login(email, password, role);
      storeSession(session);
      setUser(session.user);
    },
    async logout() {
      const sessionId = localStorage.getItem('enako_session_id');
      if (sessionId) await api.endSession(sessionId);
      await api.logout();
      clearSession();
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: RoleName[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}
