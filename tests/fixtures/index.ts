import type { Task, Project } from '@/shared/types';
import type { AuthUser } from '@/features/auth/types';

export const mockUser: AuthUser = {
  id: 'user-id-001',
  email: 'alice@example.com',
  name: 'Alice Smith',
  roles: ['admin'],
};

export const mockProject: Project = {
  id: 'project-id-001',
  name: 'Website Redesign',
  description: 'Redesign the company website',
  ownerId: mockUser.id,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockTask: Task = {
  id: 'task-id-001',
  title: 'Design mockups',
  description: 'Create Figma mockups for all key pages',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '2024-06-01T00:00:00.000Z',
  projectId: mockProject.id,
  assigneeId: mockUser.id,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockPaginatedTasks = {
  success: true,
  data: [mockTask],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};
