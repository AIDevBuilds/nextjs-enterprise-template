import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Date formatting only. Enum → label mapping (status, priority) is NOT here —
 * those are user-facing strings and must come from `messages/*.json` via
 * `t('tasks.status.TODO')`, so a translator can change them.
 *
 * For locale-aware dates prefer next-intl's `useFormatter()`; these helpers are
 * the locale-independent fallback used where no translation scope is available.
 */
export const EMPTY_VALUE = '—';

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return EMPTY_VALUE;
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return EMPTY_VALUE;
  }
}

export function formatRelative(dateString: string | null | undefined): string {
  if (!dateString) return EMPTY_VALUE;
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return EMPTY_VALUE;
  }
}
