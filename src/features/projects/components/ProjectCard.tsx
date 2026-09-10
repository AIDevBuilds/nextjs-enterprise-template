import { useTranslations } from 'next-intl';
import type { Project } from '@/features/projects/types';
import { Button } from '@/shared/components/ui/Button';
import { formatRelative } from '@/shared/utils/formatters';

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, taskCount, onEdit, onDelete }: ProjectCardProps) {
  const t = useTranslations();
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{project.name}</h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {taskCount !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {t('projects.taskCount', { count: taskCount })}
            </span>
          )}
          <span>{t('projects.createdAt', { relative: formatRelative(project.createdAt) })}</span>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              aria-label={t('projects.editAria', { name: project.name })}
            >
              {t('common.actions.edit')}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(project)}
              aria-label={t('projects.deleteAria', { name: project.name })}
            >
              {t('common.actions.delete')}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
