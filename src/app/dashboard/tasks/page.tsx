'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/shared/components/layouts/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { TaskFiltersBar } from '@/features/tasks/components/TaskFiltersBar';
import { useTasks, useDeleteTask } from '@/features/tasks/hooks/useTasks';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import type { Task } from '@/features/tasks/types';

export default function TasksPage() {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data, isLoading } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();
  const { can } = usePermission();

  const tasks = data?.data ?? [];

  return (
    <PageWrapper
      title={t('tasks.title')}
      description={t('tasks.subtitle')}
      action={
        can('task:create') ? (
          <Button onClick={() => setIsCreateOpen(true)}>{t('tasks.new')}</Button>
        ) : null
      }
    >
      <div className="space-y-4">
        <TaskFiltersBar />

        <ErrorBoundary boundary="TaskTable">
          <TaskTable
            tasks={tasks}
            isLoading={isLoading}
            onEdit={can('task:update') ? (task) => setEditingTask(task) : undefined}
            onDelete={
              can('task:delete')
                ? (task) => {
                    if (window.confirm(t('tasks.confirmDelete', { title: task.title }))) {
                      deleteTask(task.id);
                    }
                  }
                : undefined
            }
          />
        </ErrorBoundary>

        {data?.meta && (
          <p className="text-sm text-muted-foreground">
            {t('tasks.showing', { count: tasks.length, total: data.meta.total })}
          </p>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('tasks.createTitle')}
        size="lg"
      >
        <TaskForm onSuccess={() => setIsCreateOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title={t('tasks.editTitle')}
        size="lg"
      >
        {editingTask && <TaskForm task={editingTask} onSuccess={() => setEditingTask(null)} />}
      </Modal>
    </PageWrapper>
  );
}
