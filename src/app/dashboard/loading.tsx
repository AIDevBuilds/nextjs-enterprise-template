import { Spinner } from '@/shared/components/ui/Spinner';

export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Spinner size="lg" className="text-primary" />
    </div>
  );
}
