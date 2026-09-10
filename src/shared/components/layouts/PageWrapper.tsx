import { ReactNode } from 'react';

interface PageWrapperProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ title, description, action, children }: PageWrapperProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
