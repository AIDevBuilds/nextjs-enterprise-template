import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types';
import type { AuthUser } from '@/features/auth/types';
import type { LoginFormValues, RegisterFormValues } from '@/shared/utils/validators';

type SessionResponse = ApiResponse<{ user: AuthUser }>;

/**
 * Talks to the same-origin auth BFF (`/api/auth/*`). The access token is set as
 * an httpOnly cookie by the route handlers and is never returned to the client —
 * these methods only ever resolve to the `AuthUser`.
 */
export const authApi = {
  async login(payload: LoginFormValues): Promise<AuthUser> {
    const { data } = await apiClient.post<SessionResponse>('/auth/login', payload);
    return data.data.user;
  },

  async register(payload: RegisterFormValues): Promise<AuthUser> {
    const { data } = await apiClient.post<SessionResponse>('/auth/register', payload);
    return data.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async session(signal?: AbortSignal): Promise<AuthUser> {
    const { data } = await apiClient.get<SessionResponse>('/auth/session', { signal });
    return data.data.user;
  },
};
