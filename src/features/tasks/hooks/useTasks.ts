'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { tasksApi } from '@/features/tasks/api/tasksApi';
import { useTasksStore } from '@/features/tasks/store/tasksStore';
import { extractApiError } from '@/shared/utils/api-error';
import type { PaginatedResponse, Task } from '@/shared/types';
import type { TaskFilters } from '@/features/tasks/types';
import type { CreateTaskFormValues, UpdateTaskFormValues } from '@/shared/utils/validators';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export function useTasks(overrideFilters?: TaskFilters) {
  const storeFilters = useTasksStore((s) => s.filters);
  const filters = overrideFilters ?? storeFilters;

  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ signal }) => tasksApi.getMany(filters, signal),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: ({ signal }) => tasksApi.getById(id, signal),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const t = useTranslations('tasks');
  return useMutation({
    mutationFn: (values: CreateTaskFormValues) => tasksApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error) => toast.error(extractApiError(error, t('createFailed'))),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const t = useTranslations('tasks');
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateTaskFormValues }) =>
      tasksApi.update(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) });
      toast.success(t('updated'));
    },
    onError: (error) => toast.error(extractApiError(error, t('updateFailed'))),
  });
}

/**
 * Reference implementation of an optimistic mutation: snapshot every cached list,
 * remove the row immediately, roll back on error, reconcile on settle.
 */
export function useDeleteTask() {
  const qc = useQueryClient();
  const t = useTranslations('tasks');
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshots = qc.getQueriesData<PaginatedResponse<Task>>({ queryKey: taskKeys.lists() });
      snapshots.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData<PaginatedResponse<Task>>(key, {
          ...data,
          data: data.data.filter((task) => task.id !== id),
        });
      });
      return { snapshots };
    },
    onError: (error, _id, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(extractApiError(error, t('deleteFailed')));
    },
    onSuccess: () => toast.success(t('deleted')),
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}
