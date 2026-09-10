import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <>
      <p className="mb-6 text-center text-sm text-muted-foreground">{t('signInSubtitle')}</p>
      <LoginForm />
    </>
  );
}
