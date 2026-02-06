'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, type ReactNode } from 'react';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Add bottom padding for the player bar when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      document.body.classList.add('pb-20');
    } else {
      document.body.classList.remove('pb-20');
    }
    return () => document.body.classList.remove('pb-20');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
