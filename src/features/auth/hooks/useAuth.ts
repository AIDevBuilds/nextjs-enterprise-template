'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { extractApiError } from '@/shared/utils/api-error';
import type { LoginFormValues, RegisterFormValues } from '@/shared/utils/validators';

const DEFAULT_AUTHED_PATH = '/dashboard/tasks';

/** Reads a safe same-origin `?next=` path, falling back to the dashboard. */
function readNextParam(): string {
  if (typeof window === 'undefined') return DEFAULT_AUTHED_PATH;
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : DEFAULT_AUTHED_PATH;
}

export function useSession() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['session'],
    queryFn: async ({ signal }) => {
      const user = await authApi.session(signal);
      setUser(user);
      return user;
    },
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const t = useTranslations('auth');
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: (user) => {
      setUser(user);
      router.replace(readNextParam());
      router.refresh();
    },
    onError: (error) => toast.error(extractApiError(error, t('loginFailed'))),
  });
}

export function useRegister() {
  const t = useTranslations('auth');
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
    onSuccess: (user) => {
      setUser(user);
      router.replace(DEFAULT_AUTHED_PATH);
      router.refresh();
    },
    onError: (error) => toast.error(extractApiError(error, t('registerFailed'))),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    },
  });

  return { logout: mutation.mutate, isPending: mutation.isPending };
}
