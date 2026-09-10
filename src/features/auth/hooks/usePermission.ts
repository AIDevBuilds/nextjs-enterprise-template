'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  resolvePermissions,
  type Permission,
} from '@/features/auth/lib/permissions';

/**
 * Client-side authorization checks.
 *
 * ```tsx
 * const { can } = usePermission();
 * {can('task:delete') && <Button variant="danger" …/>}
 * ```
 *
 * This gates the UI only. The upstream API remains the enforcement point —
 * hiding a button is not a security control.
 */
export function usePermission() {
  const user = useAuthStore((s) => s.user);

  return useMemo(
    () => ({
      can: (permission: Permission) => hasPermission(user, permission),
      canAny: (permissions: Permission[]) => hasAnyPermission(user, permissions),
      canAll: (permissions: Permission[]) => hasAllPermissions(user, permissions),
      permissions: resolvePermissions(user),
      roles: user?.roles ?? [],
    }),
    [user],
  );
}
