'use client';

import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { getQueryClient } from '@/shared/lib/queryClient';
import { WebVitalsReporter } from '@/shared/lib/observability/WebVitalsReporter';
import { ThemeProvider } from '@/shared/lib/theme/ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(getQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WebVitalsReporter />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            // Read the theme tokens so toasts follow light/dark automatically.
            style: {
              borderRadius: '8px',
              fontSize: '14px',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
