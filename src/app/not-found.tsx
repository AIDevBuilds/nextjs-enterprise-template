import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/shared/components/ui/Button';

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl font-bold text-muted-foreground">{t('errors.notFoundCode')}</p>
      <h1 className="text-2xl font-bold text-foreground">{t('errors.notFoundTitle')}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t('errors.notFoundBody')}</p>
      <Link href="/">
        <Button>{t('common.actions.backHome')}</Button>
      </Link>
    </div>
  );
}
