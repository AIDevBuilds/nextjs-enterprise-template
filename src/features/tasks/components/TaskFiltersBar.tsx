'use client';

import { useTranslations } from 'next-intl';
import { useTasksStore } from '@/features/tasks/store/tasksStore';
import { Button } from '@/shared/components/ui/Button';

export function TaskFiltersBar() {
  const t = useTranslations();
  const { filters, setFilters, resetFilters } = useTasksStore();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium text-foreground">
          {t('common.fields.status')}
        </label>
        <select
          id="status-filter"
          value={filters.status ?? ''}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
          className="rounded-md border border-border px-2 py-1.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">{t('common.states.all')}</option>
          <option value="TODO">{t('tasks.status.TODO')}</option>
          <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
          <option value="DONE">{t('tasks.status.DONE')}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="priority-filter" className="text-sm font-medium text-foreground">
          {t('common.fields.priority')}
        </label>
        <select
          id="priority-filter"
          value={filters.priority ?? ''}
          onChange={(e) => setFilters({ priority: e.target.value as typeof filters.priority })}
          className="rounded-md border border-border px-2 py-1.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">{t('common.states.all')}</option>
          <option value="LOW">{t('tasks.priority.LOW')}</option>
          <option value="MEDIUM">{t('tasks.priority.MEDIUM')}</option>
          <option value="HIGH">{t('tasks.priority.HIGH')}</option>
        </select>
      </div>

      <Button variant="ghost" size="sm" onClick={resetFilters}>
        {t('common.actions.reset')}
      </Button>
    </div>
  );
}
