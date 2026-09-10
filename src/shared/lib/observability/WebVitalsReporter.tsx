'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { logger } from './logger';

/**
 * Reports Core Web Vitals measured on real user devices.
 *
 * Metrics: LCP (load feel), CLS (layout stability), INP (responsiveness),
 * FCP and TTFB (server + first paint). Cost is negligible — passive
 * PerformanceObservers, reported as the page is hidden.
 *
 * Records flow through the normal logger, so whatever transport you register
 * (Sentry, Datadog, a custom `/api/vitals` collector) receives them too.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    logger.info('web-vital', {
      metric: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: (metric as { rating?: string }).rating,
      navigationType: metric.navigationType,
      id: metric.id,
    });
  });

  return null;
}
