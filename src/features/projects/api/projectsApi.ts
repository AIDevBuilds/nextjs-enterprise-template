import { apiClient } from '@/shared/lib/axios';
import type { Project, ApiResponse } from '@/shared/types';

interface CreateProjectPayload {
  name: string;
  description?: string;
}

type UpdateProjectPayload = Partial<CreateProjectPayload>;

export const projectsApi = {
  async getMany(signal?: AbortSignal): Promise<Project[]> {
    const { data } = await apiClient.get<ApiResponse<Project[]>>('/projects', { signal });
    return data.data;
  },

  async getById(id: string, signal?: AbortSignal): Promise<Project> {
    const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`, { signal });
    return data.data;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await apiClient.post<ApiResponse<Project>>('/projects', payload);
    return data.data;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
