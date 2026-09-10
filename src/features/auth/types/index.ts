import type { User } from '@/shared/types';
import type { Permission, Role } from '@/features/auth/lib/permissions';

/**
 * Non-sensitive session profile. Cached in the `session_user` httpOnly cookie
 * and mirrored into the client auth store.
 *
 * `roles` drive authorization — see `features/auth/lib/permissions.ts`.
 * `permissions` are optional per-user grants layered on top of role grants.
 */
export type AuthUser = Pick<User, 'id' | 'email' | 'name'> & {
  roles: Role[];
  permissions?: Permission[];
};
