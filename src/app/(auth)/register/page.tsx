import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage() {
  const t = await getTranslations('auth');

  return (
    <>
      <p className="text-muted-foreground mb-6 text-center text-sm">{t('registerSubtitle')}</p>
      <RegisterForm />
    </>
  );
}
