export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

/** Arbitrary structured fields attached to a log record. Keep values serialisable. */
export type LogContext = Record<string, unknown>;

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
}

/** One structured log record. This is the shape every transport receives. */
export interface LogRecord {
  level: LogLevel;
  message: string;
  /** ISO-8601 UTC. */
  timestamp: string;
  /** 'browser' | 'server' | 'edge' — where the record was produced. */
  runtime: string;
  context?: LogContext;
  error?: SerializedError;
}

/**
 * A sink for log records. Register your own with `addLogTransport` to forward
 * records to Sentry, Crashlytics, Datadog, an HTTP collector, etc.
 *
 * Transports must never throw — the logger swallows errors, but a slow or
 * failing transport still costs the caller time.
 */
export type LogTransport = (record: LogRecord) => void;
