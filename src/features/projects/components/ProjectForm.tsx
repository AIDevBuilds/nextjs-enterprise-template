'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectFormValues } from '@/shared/utils/validators';
import { useCreateProject, useUpdateProject } from '@/features/projects/hooks/useProjects';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import type { Project } from '@/features/projects/types';

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const t = useTranslations();
  const isEditMode = !!project;
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({ name: project.name, description: project.description ?? '' });
    }
  }, [project, reset]);

  const onSubmit = (values: CreateProjectFormValues) => {
    if (isEditMode) {
      updateProject({ id: project.id, values }, { onSuccess });
    } else {
      createProject(values, { onSuccess });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label={t('projects.nameLabel')}
        placeholder={t('projects.namePlaceholder')}
        error={errors.name?.message && t(errors.name.message)}
        {...register('name')}
      />

      <Textarea
        label={t('common.fields.description')}
        rows={3}
        placeholder={t('common.placeholders.optionalDescription')}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>
          {isEditMode ? t('common.actions.save') : t('projects.createSubmit')}
        </Button>
      </div>
    </form>
  );
}
