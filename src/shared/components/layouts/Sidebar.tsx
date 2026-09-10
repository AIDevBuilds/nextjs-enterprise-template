'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { env } from '@/env';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { LocaleSwitcher } from '@/shared/components/ui/LocaleSwitcher';

interface NavItem {
  labelKey: 'tasks' | 'projects';
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    labelKey: 'tasks',
    href: '/dashboard/tasks',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    labelKey: 'projects',
    href: '/dashboard/projects',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { logout, isPending } = useLogout();

  return (
    <aside className="border-border bg-card flex h-full w-64 flex-col border-r">
      <div className="border-border flex h-16 items-center border-b px-6">
        <span className="text-primary text-lg font-bold">{env.NEXT_PUBLIC_APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {t(`nav.${item.labelKey}`)}
            </Link>
          );
        })}
      </nav>

      <div className="border-border space-y-3 border-t p-4">
        <ThemeToggle className="w-full justify-center" />
        <LocaleSwitcher />

        {user && (
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {t('common.actions.signOut')}
        </button>
      </div>
    </aside>
  );
}
