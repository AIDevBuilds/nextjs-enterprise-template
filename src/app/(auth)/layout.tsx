import { env } from '@/env';

/**
 * Master page for unauthenticated screens (login, register, forgot/reset
 * password). Owns the centred card shell and the product wordmark so each page
 * only supplies its heading + form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-foreground mb-8 text-center text-3xl font-bold">
          {env.NEXT_PUBLIC_APP_NAME}
        </h1>
        <main className="bg-card ring-border rounded-xl px-6 py-8 shadow-md ring-1">
          {children}
        </main>
      </div>
    </div>
  );
}
