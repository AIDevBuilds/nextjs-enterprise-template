'use client';

import { useTranslations } from 'next-intl';
import type { Task } from '@/features/tasks/types';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { formatDate, EMPTY_VALUE } from '@/shared/utils/formatters';

interface TaskTableProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskTable({ tasks, isLoading, onEdit, onDelete }: TaskTableProps) {
  const t = useTranslations();
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
        <p className="text-lg font-medium">{t('tasks.empty')}</p>
        <p className="text-sm">{t('tasks.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {(
              [
                'common.fields.title',
                'common.fields.status',
                'common.fields.priority',
                'common.fields.dueDate',
                'common.fields.assignee',
                'common.fields.actions',
              ] as const
            ).map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {t(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-accent">
              <td className="max-w-xs px-4 py-3">
                <p className="truncate font-medium text-foreground">{task.title}</p>
                {task.description && (
                  <p className="truncate text-xs text-muted-foreground">{task.description}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge status={task.status}>{t(`tasks.status.${task.status}`)}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge priority={task.priority}>{t(`tasks.priority.${task.priority}`)}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(task.dueDate)}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {task.assigneeId ? task.assigneeId.slice(0, 8) + '…' : EMPTY_VALUE}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      aria-label={t('tasks.editAria', { title: task.title })}
                    >
                      {t('common.actions.edit')}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(task)}
                      aria-label={t('tasks.deleteAria', { title: task.title })}
                    >
                      {t('common.actions.delete')}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
