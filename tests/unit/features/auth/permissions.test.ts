import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isRole,
  resolvePermissions,
} from '@/features/auth/lib/permissions';
import type { AuthUser } from '@/features/auth/types';

const user = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'u1',
  email: 'a@example.com',
  name: 'A',
  roles: [],
  ...overrides,
});

describe('isRole', () => {
  it('accepts known roles and rejects anything else', () => {
    expect(isRole('admin')).toBe(true);
    expect(isRole('viewer')).toBe(true);
    expect(isRole('superuser')).toBe(false);
    expect(isRole(null)).toBe(false);
  });
});

describe('resolvePermissions', () => {
  it('returns nothing for an anonymous session', () => {
    expect(resolvePermissions(null).size).toBe(0);
  });

  it('unions the grants of every role', () => {
    const resolved = resolvePermissions(user({ roles: ['viewer', 'member'] }));
    expect(resolved.has('task:read')).toBe(true);
    expect(resolved.has('task:create')).toBe(true); // from member
    expect(resolved.has('task:delete')).toBe(false); // neither role grants it
  });

  it('layers per-user grants on top of role grants', () => {
    const resolved = resolvePermissions(
      user({ roles: ['viewer'], permissions: ['project:delete'] }),
    );
    expect(resolved.has('project:delete')).toBe(true);
    expect(resolved.has('task:read')).toBe(true);
  });

  it('admin holds every permission', () => {
    const resolved = resolvePermissions(user({ roles: ['admin'] }));
    expect(resolved.has('user:manage')).toBe(true);
    expect(resolved.has('project:delete')).toBe(true);
  });
});

describe('permission checks', () => {
  it('hasPermission gates a single capability', () => {
    expect(hasPermission(user({ roles: ['member'] }), 'task:create')).toBe(true);
    expect(hasPermission(user({ roles: ['member'] }), 'task:delete')).toBe(false);
    expect(hasPermission(null, 'task:read')).toBe(false);
  });

  it('hasAnyPermission needs one match', () => {
    const viewer = user({ roles: ['viewer'] });
    expect(hasAnyPermission(viewer, ['task:delete', 'task:read'])).toBe(true);
    expect(hasAnyPermission(viewer, ['task:delete', 'user:manage'])).toBe(false);
  });

  it('hasAllPermissions needs every match', () => {
    const manager = user({ roles: ['manager'] });
    expect(hasAllPermissions(manager, ['task:read', 'task:delete'])).toBe(true);
    expect(hasAllPermissions(manager, ['task:read', 'user:manage'])).toBe(false);
  });
});
