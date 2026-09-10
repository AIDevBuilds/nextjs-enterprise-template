'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/Button';
import { captureException } from '@/shared/lib/observability/logger';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    captureException(error, { boundary: 'dashboard', digest: error.digest });
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-foreground">{t('errors.sectionTitle')}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{t('errors.sectionBody')}</p>
      <Button onClick={reset}>{t('common.actions.tryAgain')}</Button>
    </div>
  );
}
