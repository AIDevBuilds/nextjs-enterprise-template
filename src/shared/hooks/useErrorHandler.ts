'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { captureException } from '@/shared/lib/observability/logger';
import { extractApiError } from '@/shared/utils/api-error';
import type { LogContext } from '@/shared/lib/observability/types';

interface HandleErrorOptions {
  /** Message shown to the user when the error carries no API message. */
  fallbackMessage?: string;
  /** Extra structured fields for the log record. */
  context?: LogContext;
  /** Set false to report silently without a toast. */
  notify?: boolean;
}

/**
 * Handles errors that React error boundaries cannot catch: event handlers,
 * `setTimeout`/`setInterval`, promise callbacks, and any imperative code.
 *
 * ```tsx
 * const handleError = useErrorHandler();
 * const onClick = async () => {
 *   try { await doThing(); }
 *   catch (error) { handleError(error, { context: { taskId } }); }
 * };
 * ```
 */
export function useErrorHandler() {
  return useCallback((error: unknown, options: HandleErrorOptions = {}) => {
    const { fallbackMessage = 'Something went wrong', context, notify = true } = options;
    const message = extractApiError(error, fallbackMessage);

    captureException(error, { ...context, userFacingMessage: message });
    if (notify) toast.error(message);

    return message;
  }, []);
}
