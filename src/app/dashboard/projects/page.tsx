'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/shared/components/layouts/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { useProjects, useDeleteProject } from '@/features/projects/hooks/useProjects';
import { Can } from '@/features/auth/components/Can';
import { usePermission } from '@/features/auth/hooks/usePermission';
import type { Project } from '@/features/projects/types';

export default function ProjectsPage() {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data, isLoading } = useProjects();
  const { mutate: deleteProject } = useDeleteProject();
  const { can } = usePermission();

  const projects = data ?? [];

  return (
    <PageWrapper
      title={t('projects.title')}
      description={t('projects.subtitle')}
      action={
        <Can permission="project:create">
          <Button onClick={() => setIsCreateOpen(true)}>{t('projects.new')}</Button>
        </Can>
      }
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-medium">{t('projects.empty')}</p>
          <p className="text-sm">{t('projects.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={can('project:update') ? (p) => setEditingProject(p) : undefined}
              onDelete={
                can('project:delete')
                  ? (p) => {
                      if (window.confirm(t('projects.confirmDelete', { name: p.name }))) {
                        deleteProject(p.id);
                      }
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('projects.createTitle')}
      >
        <ProjectForm onSuccess={() => setIsCreateOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title={t('projects.editTitle')}
      >
        {editingProject && (
          <ProjectForm project={editingProject} onSuccess={() => setEditingProject(null)} />
        )}
      </Modal>
    </PageWrapper>
  );
}
