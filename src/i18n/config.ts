/**
 * Locale configuration.
 *
 * Strategy: **cookie-based, no URL prefix.** URLs stay `/dashboard/tasks`
 * rather than `/en/dashboard/tasks`, so routing, the auth middleware and every
 * link stay locale-agnostic. Suitable for an authenticated product; if you later
 * need per-locale URLs for SEO, switch to next-intl's routing middleware.
 *
 * Edge-safe: plain constants only, no imports.
 */
export const LOCALES = ['en', 'hi'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Cookie the chosen locale is stored in. Readable by JS — not sensitive. */
export const LOCALE_COOKIE = 'locale';

/** Display names for the locale switcher, in their own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.split('-')[0].toLowerCase(), quality: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  return (ranked.find((entry) => isLocale(entry.tag))?.tag as Locale | undefined) ?? DEFAULT_LOCALE;
}
