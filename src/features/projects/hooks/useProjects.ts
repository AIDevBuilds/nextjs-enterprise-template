'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { projectsApi } from '@/features/projects/api/projectsApi';
import { extractApiError } from '@/shared/utils/api-error';
import type { CreateProjectFormValues, UpdateProjectFormValues } from '@/shared/utils/validators';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: ({ signal }) => projectsApi.getMany(signal),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: ({ signal }) => projectsApi.getById(id, signal),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const t = useTranslations('projects');
  return useMutation({
    mutationFn: (values: CreateProjectFormValues) => projectsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error) => toast.error(extractApiError(error, t('createFailed'))),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const t = useTranslations('projects');
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateProjectFormValues }) =>
      projectsApi.update(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
      toast.success(t('updated'));
    },
    onError: (error) => toast.error(extractApiError(error, t('updateFailed'))),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const t = useTranslations('projects');
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error) => toast.error(extractApiError(error, t('deleteFailed'))),
  });
}
