import { apiClient } from '@/shared/lib/axios';
import type { Task, ApiResponse, PaginatedResponse } from '@/shared/types';
import type { TaskFilters } from '@/features/tasks/types';

interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
}

type UpdateTaskPayload = Partial<CreateTaskPayload>;

export const tasksApi = {
  async getMany(filters: TaskFilters = {}, signal?: AbortSignal): Promise<PaginatedResponse<Task>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    );
    const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params, signal });
    return data;
  },

  async getById(id: string, signal?: AbortSignal): Promise<Task> {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`, { signal });
    return data.data;
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
    return data.data;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
