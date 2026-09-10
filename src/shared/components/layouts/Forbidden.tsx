import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/Button';

interface ForbiddenProps {
  /** Optional hint about what was required, e.g. "user:manage". */
  requiredPermission?: string;
}

/** Rendered in place of a page or section the current session may not view. */
export function Forbidden({ requiredPermission }: ForbiddenProps) {
  const t = useTranslations();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-muted-foreground text-5xl font-bold">{t('errors.forbiddenCode')}</p>
      <h1 className="text-foreground text-xl font-semibold">{t('errors.forbiddenTitle')}</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        {t('errors.forbiddenBody')}
        {requiredPermission ? (
          <> {t('errors.forbiddenRequired', { permission: requiredPermission })}</>
        ) : null}
      </p>
      <Link href="/dashboard/tasks">
        <Button variant="secondary" size="sm">
          {t('errors.backToTasks')}
        </Button>
      </Link>
    </div>
  );
}
