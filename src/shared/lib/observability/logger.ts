import {
  LOG_LEVELS,
  type LogContext,
  type LogLevel,
  type LogRecord,
  type LogTransport,
  type SerializedError,
} from './types';

/**
 * Structured logger. Every call produces a `LogRecord` object (never a
 * free-text string) and hands it to every registered transport.
 *
 * No database and no service are required: the default transport writes to
 * stdout/console, where your platform (Vercel, CloudWatch, Datadog, …) picks it
 * up. To ship errors somewhere else, register a transport once at startup —
 * see `addLogTransport` and `docs` in ARCHITECTURE.md.
 */

function detectRuntime(): string {
  if (typeof window !== 'undefined') return 'browser';
  // The Edge runtime exposes a global `EdgeRuntime` string.
  if (typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime === 'string') return 'edge';
  return 'server';
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }
  return { name: 'NonError', message: typeof error === 'string' ? error : JSON.stringify(error) };
}

/** Default transport: structured JSON on the server, readable groups in the browser. */
export const consoleTransport: LogTransport = (record) => {
  if (record.runtime === 'browser') {
    const method = record.level === 'error' ? 'error' : record.level === 'warn' ? 'warn' : 'log';
    console[method](`[${record.level}] ${record.message}`, {
      ...record.context,
      ...(record.error ? { error: record.error } : {}),
    });
    return;
  }
  // One JSON object per line — the format log aggregators expect.
  console[record.level === 'error' ? 'error' : 'log'](JSON.stringify(record));
};

const transports: LogTransport[] = [consoleTransport];

/**
 * Register an additional sink. Call once during app start-up, e.g.
 *
 * ```ts
 * addLogTransport((record) => {
 *   if (record.level !== 'error') return;
 *   Sentry.captureException(record.error, { extra: record.context });
 * });
 * ```
 */
export function addLogTransport(transport: LogTransport): () => void {
  transports.push(transport);
  return () => {
    const index = transports.indexOf(transport);
    if (index !== -1) transports.splice(index, 1);
  };
}

/** Replace every transport (including the console default). Mainly for tests. */
export function setLogTransports(next: LogTransport[]): void {
  transports.splice(0, transports.length, ...next);
}

function resolveMinLevel(): LogLevel {
  const configured = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  if (configured && LOG_LEVELS.includes(configured)) return configured;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(resolveMinLevel());
}

function emit(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
  if (!shouldLog(level)) return;

  const record: LogRecord = {
    level,
    message,
    timestamp: new Date().toISOString(),
    runtime: detectRuntime(),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };

  for (const transport of transports) {
    try {
      transport(record);
    } catch {
      // A broken transport must never break the caller.
    }
  }
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  /** Returns a logger that merges `boundContext` into every record. */
  child(boundContext: LogContext): Logger;
}

function createLogger(boundContext: LogContext = {}): Logger {
  const merge = (context?: LogContext) => ({ ...boundContext, ...context });

  return {
    debug: (message, context) => emit('debug', message, merge(context)),
    info: (message, context) => emit('info', message, merge(context)),
    warn: (message, context) => emit('warn', message, merge(context)),
    error: (message, error, context) => emit('error', message, merge(context), error),
    child: (childContext) => createLogger({ ...boundContext, ...childContext }),
  };
}

/** App-wide logger. Prefer `logger.child({ feature: 'tasks' })` inside a feature. */
export const logger = createLogger();

/**
 * Report an unexpected error. Use this in catch blocks, event handlers, async
 * callbacks and error boundaries — anywhere a render-time boundary can't help.
 */
export function captureException(error: unknown, context?: LogContext): void {
  emit('error', error instanceof Error ? error.message : 'Unhandled exception', context, error);
}
