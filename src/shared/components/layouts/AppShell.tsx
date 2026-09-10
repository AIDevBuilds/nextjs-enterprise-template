'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { Sidebar } from './Sidebar';

/**
 * Authenticated application shell (the "master page" for the dashboard).
 * Sidebar is fixed from `lg` up and an off-canvas drawer below it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation.
  useEffect(() => setIsNavOpen(false), [pathname]);

  useEffect(() => {
    if (!isNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setIsNavOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isNavOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        onClick={() => setIsNavOpen(false)}
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden',
          isNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 lg:static lg:translate-x-0',
          isNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Plain div, not <header>: PageWrapper already owns the banner landmark. */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsNavOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={isNavOpen}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
