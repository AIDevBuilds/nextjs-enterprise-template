import { cn } from '@/shared/utils/cn';
import type { TaskStatus, Priority } from '@/shared/types';

type BadgeColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

/**
 * Badges use translucent tints of the token colours so a single definition
 * reads correctly in both themes — no `dark:` variants needed.
 */
const colorClasses: Record<BadgeColor, string> = {
  gray: 'bg-muted text-muted-foreground',
  blue: 'bg-primary/15 text-primary',
  green: 'bg-success/15 text-success',
  yellow: 'bg-warning/15 text-warning',
  red: 'bg-danger/15 text-danger',
  purple: 'bg-accent text-accent-foreground',
};

const statusColorMap: Record<TaskStatus, BadgeColor> = {
  TODO: 'gray',
  IN_PROGRESS: 'blue',
  DONE: 'green',
};

const priorityColorMap: Record<Priority, BadgeColor> = {
  LOW: 'gray',
  MEDIUM: 'yellow',
  HIGH: 'red',
};

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  status?: TaskStatus;
  priority?: Priority;
  className?: string;
}

export function Badge({ children, color, status, priority, className }: BadgeProps) {
  let resolvedColor: BadgeColor = color ?? 'gray';
  if (status) resolvedColor = statusColorMap[status];
  if (priority) resolvedColor = priorityColorMap[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses[resolvedColor],
        className,
      )}
    >
      {children}
    </span>
  );
}
