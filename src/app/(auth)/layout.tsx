import { env } from '@/env';

/**
 * Master page for unauthenticated screens (login, register, forgot/reset
 * password). Owns the centred card shell and the product wordmark so each page
 * only supplies its heading + form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
          {env.NEXT_PUBLIC_APP_NAME}
        </h1>
        <main className="rounded-xl bg-card px-6 py-8 shadow-md ring-1 ring-border">
          {children}
        </main>
      </div>
    </div>
  );
}
