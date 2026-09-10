import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useTasks, useCreateTask, useDeleteTask } from '@/features/tasks/hooks/useTasks';
import { mockTask } from '@tests/fixtures';
import { createWrapper } from '@tests/utils/render';

import { server } from '../../../mocks/server';

describe('useTasks', () => {
  it('fetches and returns paginated tasks', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].id).toBe(mockTask.id);
    expect(result.current.data?.meta.total).toBe(1);
  });

  it('returns empty data array when API returns no tasks', async () => {
    server.use(
      http.get('*/tasks', () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false },
        }),
      ),
    );

    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(0);
  });
});

describe('useCreateTask', () => {
  it('calls API and invalidates task list on success', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateTask(), { wrapper });

    act(() => {
      result.current.mutate({
        title: 'New Task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: 'project-id-001',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe('New Task');
  });
});

describe('useDeleteTask', () => {
  it('calls delete API successfully', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    act(() => {
      result.current.mutate(mockTask.id);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('surfaces error on forbidden delete', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    act(() => {
      result.current.mutate('forbidden');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
