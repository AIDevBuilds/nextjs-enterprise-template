'use client';

import { useState, type ReactNode } from 'react';
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
  // A useState initializer runs exactly once per instance, before children
  // render — so the store is seeded with no logged-out flash and without
  // reading a ref during render (which React 19's compiler rules reject).
  useState(() => {
    useAuthStore.setState({ user: initialUser, isAuthenticated: Boolean(initialUser) });
    return null;
  });

  return <>{children}</>;
}
