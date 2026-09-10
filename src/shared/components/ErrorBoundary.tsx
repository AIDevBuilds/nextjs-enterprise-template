'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { captureException } from '@/shared/lib/observability/logger';
import { Button } from '@/shared/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Added to the captured error's context — e.g. "TaskTable". */
  boundary?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Default fallback. A function component so it can use translation hooks. */
function DefaultFallback({ reset }: { reset: () => void }) {
  const t = useTranslations('errors');

  return (
    <div
      role="alert"
      className="border-border bg-card flex flex-col items-center justify-center gap-3 rounded-lg border p-6 text-center"
    >
      <p className="text-foreground font-medium">{t('boundaryTitle')}</p>
      <p className="text-muted-foreground max-w-sm text-sm">{t('boundaryBody')}</p>
      <Button size="sm" variant="secondary" onClick={reset}>
        {t('tryAgain')}
      </Button>
    </div>
  );
}

/**
 * Client-side error boundary for isolating a *part* of a page.
 *
 * Next's `error.tsx` files catch render errors for a whole route segment; this
 * lets one widget fail without taking the rest of the screen with it. Like all
 * React boundaries it catches errors thrown during render/lifecycle — NOT
 * errors in event handlers or async callbacks. For those use `useErrorHandler`
 * or call `captureException` directly.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureException(error, {
      boundary: this.props.boundary ?? 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return <DefaultFallback reset={this.reset} />;
  }
}
