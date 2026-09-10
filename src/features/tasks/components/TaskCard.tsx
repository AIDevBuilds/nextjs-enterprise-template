import { useTranslations } from 'next-intl';
import type { Task } from '@/features/tasks/types';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatDate } from '@/shared/utils/formatters';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const t = useTranslations();
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground">{task.title}</h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 gap-1">
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
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge status={task.status}>{t(`tasks.status.${task.status}`)}</Badge>
        <Badge priority={task.priority}>{t(`tasks.priority.${task.priority}`)}</Badge>
        {task.dueDate && (
          <span className="text-xs text-muted-foreground">
            {t('tasks.due', { date: formatDate(task.dueDate) })}
          </span>
        )}
        {task.assigneeId && (
          <span className="text-xs text-muted-foreground">
            {t('common.fields.assignee')}: {task.assigneeId.slice(0, 8)}
          </span>
        )}
      </div>
    </article>
  );
}
