import { create } from 'zustand';
import type { TaskFilters } from '@/features/tasks/types';

interface TasksStoreState {
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: TaskFilters = {
  status: '',
  priority: '',
  page: 1,
  limit: 20,
};

export const useTasksStore = create<TasksStoreState>((set) => ({
  filters: defaultFilters,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
