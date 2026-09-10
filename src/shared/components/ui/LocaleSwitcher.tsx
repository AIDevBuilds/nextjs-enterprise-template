'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, type Locale } from '@/i18n/config';
import { cn } from '@/shared/utils/cn';

/**
 * Writes the locale cookie and refreshes so the server re-renders with the new
 * messages. No URL change — see `src/i18n/config.ts` for the strategy.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('locale');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: Locale) => {
    // One year, site-wide; not sensitive so it need not be httpOnly.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <select
      aria-label={t('label')}
      value={locale}
      disabled={isPending}
      onChange={(event) => onChange(event.target.value as Locale)}
      className={cn(
        'border-border bg-card text-foreground w-full rounded-md border px-2 py-1.5 text-sm',
        'focus:ring-ring focus:ring-2 focus:outline-hidden disabled:opacity-60',
        className,
      )}
    >
      {LOCALES.map((value) => (
        <option key={value} value={value}>
          {LOCALE_LABELS[value]}
        </option>
      ))}
    </select>
  );
}
