export type { Task, TaskStatus, Priority } from '@/shared/types';

export interface TaskFilters {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | '';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | '';
  projectId?: string;
  assigneeId?: string;
  page?: number;
  limit?: number;
}
