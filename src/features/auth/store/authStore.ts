import { create } from 'zustand';
import type { AuthUser } from '@/features/auth/types';

/**
 * Client-side view of the session. Holds the user profile ONLY — never the token
 * (the token is an httpOnly cookie). Not persisted: the server shell hydrates
 * this store from cookies on every load via `<AuthProvider>`.
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  clear: () => set({ user: null, isAuthenticated: false }),
}));
