'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface User {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isSubscribed: boolean;
  tiers: string[];
  authProvider?: 'patreon' | 'audius';
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider?: 'patreon' | 'audius') => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = useCallback((provider?: 'patreon' | 'audius') => {
    const authProvider = provider || 'patreon';
    window.location.href = `/api/auth/${authProvider}`;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
