import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/shared/components/ui/Button';

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground text-5xl font-bold">{t('errors.notFoundCode')}</p>
      <h1 className="text-foreground text-2xl font-bold">{t('errors.notFoundTitle')}</h1>
      <p className="text-muted-foreground max-w-md text-sm">{t('errors.notFoundBody')}</p>
      <Link href="/">
        <Button>{t('common.actions.backHome')}</Button>
      </Link>
    </div>
  );
}
