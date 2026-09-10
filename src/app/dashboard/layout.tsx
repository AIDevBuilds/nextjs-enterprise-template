import { redirect } from 'next/navigation';
import { getServerSession } from '@/shared/lib/auth/session';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { AppShell } from '@/shared/components/layouts/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) redirect('/login');

  return (
    <AuthProvider initialUser={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
