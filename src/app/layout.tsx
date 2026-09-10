import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { env } from '@/env';
import { THEME_INIT_SCRIPT } from '@/shared/lib/theme/theme';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: `${env.NEXT_PUBLIC_APP_NAME} — built on the Next.js base template`,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    // `suppressHydrationWarning`: the inline script below mutates <html> before
    // React hydrates, which is expected and only affects this element.
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Blocking, so the correct theme is applied before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
