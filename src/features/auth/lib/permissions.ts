import type { AuthUser } from '@/features/auth/types';

/**
 * Authorization model: **roles carry permissions, code checks permissions.**
 *
 * Never write `user.roles.includes('admin')` in a component — check a
 * permission. That way adding a role, or moving a capability between roles, is
 * a one-line change in `ROLE_PERMISSIONS` instead of a codebase-wide hunt.
 */

export const ROLES = ['admin', 'manager', 'member', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'task:read',
  'task:create',
  'task:update',
  'task:delete',
  'project:read',
  'project:create',
  'project:update',
  'project:delete',
  'user:read',
  'user:manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/** The single place capabilities are granted. Edit this, not call sites. */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: [...PERMISSIONS],
  manager: [
    'task:read',
    'task:create',
    'task:update',
    'task:delete',
    'project:read',
    'project:create',
    'project:update',
    'user:read',
  ],
  member: ['task:read', 'task:create', 'task:update', 'project:read'],
  viewer: ['task:read', 'project:read'],
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/**
 * Effective permissions = union of every role's grants, plus any per-user
 * grants the backend attached directly.
 */
export function resolvePermissions(user: AuthUser | null): ReadonlySet<Permission> {
  if (!user) return new Set();

  const resolved = new Set<Permission>(user.permissions ?? []);
  for (const role of user.roles) {
    for (const permission of ROLE_PERMISSIONS[role] ?? []) {
      resolved.add(permission);
    }
  }
  return resolved;
}

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  return resolvePermissions(user).has(permission);
}

export function hasAnyPermission(user: AuthUser | null, permissions: Permission[]): boolean {
  const resolved = resolvePermissions(user);
  return permissions.some((permission) => resolved.has(permission));
}

export function hasAllPermissions(user: AuthUser | null, permissions: Permission[]): boolean {
  const resolved = resolvePermissions(user);
  return permissions.every((permission) => resolved.has(permission));
}
