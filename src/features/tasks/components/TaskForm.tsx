'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTaskSchema,
  type CreateTaskFormInput,
  type CreateTaskFormValues,
} from '@/shared/utils/validators';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import type { Task } from '@/features/tasks/types';

interface TaskFormProps {
  task?: Task;
  defaultProjectId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, defaultProjectId, onSuccess }: TaskFormProps) {
  const t = useTranslations();
  const isEditMode = !!task;
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { data: projectsData } = useProjects();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // Input/output generics: the form holds the input shape (defaults not yet
    // applied), the resolver hands `onSubmit` the parsed output shape.
  } = useForm<CreateTaskFormInput, unknown, CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate ?? null,
      projectId: task?.projectId ?? defaultProjectId ?? '',
      assigneeId: task?.assigneeId ?? null,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
      });
    }
  }, [task, reset]);

  const onSubmit = (values: CreateTaskFormValues) => {
    if (isEditMode) {
      updateTask({ id: task.id, values }, { onSuccess });
    } else {
      createTask(values, { onSuccess });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label={t('common.fields.title')}
        placeholder={t('tasks.titlePlaceholder')}
        error={errors.title?.message && t(errors.title.message)}
        {...register('title')}
      />

      <Textarea
        label={t('common.fields.description')}
        rows={3}
        placeholder={t('common.placeholders.optionalDescription')}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('common.fields.status')}
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="TODO">{t('tasks.status.TODO')}</option>
          <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
          <option value="DONE">{t('tasks.status.DONE')}</option>
        </Select>

        <Select
          label={t('common.fields.priority')}
          error={errors.priority?.message}
          {...register('priority')}
        >
          <option value="LOW">{t('tasks.priority.LOW')}</option>
          <option value="MEDIUM">{t('tasks.priority.MEDIUM')}</option>
          <option value="HIGH">{t('tasks.priority.HIGH')}</option>
        </Select>
      </div>

      <Select
        label={t('common.fields.project')}
        error={errors.projectId?.message && t(errors.projectId.message)}
        {...register('projectId')}
      >
        <option value="">{t('tasks.selectProject')}</option>
        {projectsData?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      <Input
        label={t('common.fields.dueDate')}
        type="date"
        error={errors.dueDate?.message}
        {...register('dueDate')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {isEditMode ? t('common.actions.save') : t('tasks.createSubmit')}
        </Button>
      </div>
    </form>
  );
}
