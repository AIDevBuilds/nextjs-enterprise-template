'use client';

import { useTranslations } from 'next-intl';
import { useTheme, type Theme } from '@/shared/lib/theme/theme';
import { cn } from '@/shared/utils/cn';

const OPTIONS: { value: Theme; labelKey: 'light' | 'system' | 'dark'; icon: React.ReactNode }[] = [
  {
    value: 'light',
    labelKey: 'light',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="4" strokeWidth={2} />
        <path
          strokeLinecap="round"
          strokeWidth={2}
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    labelKey: 'system',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="12" rx="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M8 20h8" />
      </svg>
    ),
  },
  {
    value: 'dark',
    labelKey: 'dark',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    ),
  },
];

/** Three-way theme switch: light / system / dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={t('label')}
      className={cn('inline-flex rounded-lg border border-border bg-muted p-0.5', className)}
    >
      {OPTIONS.map((option) => {
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={t(option.labelKey)}
            title={t(option.labelKey)}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex items-center justify-center rounded-md p-1.5 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
