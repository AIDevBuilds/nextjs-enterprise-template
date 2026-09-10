'use client';

import type { ReactNode } from 'react';
import { usePermission } from '@/features/auth/hooks/usePermission';
import type { Permission } from '@/features/auth/lib/permissions';

interface CanProps {
  /** Single permission, or a list. */
  permission: Permission | Permission[];
  /** With a list: require every permission instead of any one. */
  requireAll?: boolean;
  /** Rendered when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Declarative UI gate.
 *
 * ```tsx
 * <Can permission="task:delete">
 *   <Button variant="danger">Delete</Button>
 * </Can>
 * ```
 */
export function Can({ permission, requireAll = false, fallback = null, children }: CanProps) {
  const { can, canAny, canAll } = usePermission();

  const permitted = Array.isArray(permission)
    ? requireAll
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  return <>{permitted ? children : fallback}</>;
}
