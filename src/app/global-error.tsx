'use client';

import { useEffect } from 'react';
import { captureException } from '@/shared/lib/observability/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { boundary: 'global', digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Application error</h1>
        <p style={{ color: '#6b7280', maxWidth: '28rem' }}>
          The application failed to load. Please refresh the page.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '0.375rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
