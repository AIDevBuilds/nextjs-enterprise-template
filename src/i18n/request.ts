import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, negotiateLocale } from './config';

/**
 * Resolves the request locale server-side: explicit cookie choice first, then
 * the browser's Accept-Language, then the default.
 */
export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored)
    ? stored
    : negotiateLocale((await headers()).get('accept-language'));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Keep formatting deterministic across environments.
    timeZone: 'UTC',
    now: new Date(),
    onError(error) {
      // A missing translation should be loud in dev, silent-ish in production.
      if (process.env.NODE_ENV !== 'production') console.error(error);
    },
    getMessageFallback({ key, namespace }) {
      return `${namespace ? `${namespace}.` : ''}${key}`;
    },
  };
});

export { DEFAULT_LOCALE };
