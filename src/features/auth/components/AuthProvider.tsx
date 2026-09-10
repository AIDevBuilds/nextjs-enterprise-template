'use client';

import { useRef, type ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthUser } from '@/features/auth/types';

interface AuthProviderProps {
  initialUser: AuthUser | null;
  children: ReactNode;
}

/**
 * Seeds the client auth store with the session resolved on the server. Rendered
 * once, high in the authenticated tree. Synchronous so there is no logged-out
 * flash on first paint.
 */
export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const hydrated = useRef(false);
  if (!hydrated.current) {
    useAuthStore.setState({ user: initialUser, isAuthenticated: Boolean(initialUser) });
    hydrated.current = true;
  }
  return <>{children}</>;
}
