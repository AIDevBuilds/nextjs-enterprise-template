import 'server-only';
import { getServerSession } from './session';
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type Permission,
} from '@/features/auth/lib/permissions';

/**
 * Server-side authorization checks for Server Components and Route Handlers.
 *
 * ```tsx
 * export default async function Page() {
 *   if (!(await canServer('user:manage'))) return <Forbidden />;
 *   …
 * }
 * ```
 *
 * These read the session cookie, so they reflect what the backend granted at
 * login. They are a UX and defence-in-depth layer — the upstream API is still
 * the authority on every mutation.
 */
export async function canServer(permission: Permission): Promise<boolean> {
  return hasPermission(await getServerSession(), permission);
}

export async function canAnyServer(permissions: Permission[]): Promise<boolean> {
  return hasAnyPermission(await getServerSession(), permissions);
}

export async function canAllServer(permissions: Permission[]): Promise<boolean> {
  return hasAllPermissions(await getServerSession(), permissions);
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = 'ForbiddenError';
  }
}

/** Throws `ForbiddenError` when the session lacks the permission. */
export async function requirePermission(permission: Permission): Promise<void> {
  if (!(await canServer(permission))) throw new ForbiddenError(permission);
}
