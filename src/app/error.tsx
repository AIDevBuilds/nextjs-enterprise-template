'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/Button';
import { captureException } from '@/shared/lib/observability/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    captureException(error, { boundary: 'app-root', digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t('errors.genericTitle')}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t('errors.genericBody')}</p>
      <Button onClick={reset}>{t('common.actions.tryAgain')}</Button>
    </div>
  );
}
