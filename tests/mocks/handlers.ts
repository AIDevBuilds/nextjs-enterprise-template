import { http, HttpResponse } from 'msw';
import { mockTask, mockProject, mockUser, mockPaginatedTasks } from '@tests/fixtures';

/**
 * Unit tests exercise the client stack (hooks → feature api → axios). axios has
 * `baseURL: '/api'`, so requests resolve to `http://localhost/api/*` in jsdom.
 * Wildcard patterns keep handlers independent of origin.
 *
 * The BFF auth routes (`/api/auth/*`) return only `{ user }` — the token is an
 * httpOnly cookie the browser/test never sees.
 */
export const handlers = [
  // ── Auth (BFF, same origin) ──────────────────────────────────────────────
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'wrong@example.com' || body.password === 'wrongpassword') {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } },
        { status: 401 },
      );
    }
    return HttpResponse.json({ success: true, data: { user: mockUser } });
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: "Email 'existing@example.com' is already registered",
          },
        },
        { status: 409 },
      );
    }
    return HttpResponse.json({ success: true, data: { user: mockUser } }, { status: 201 });
  }),

  http.post('*/api/auth/logout', () => HttpResponse.json({ success: true })),

  http.get('*/api/auth/session', () =>
    HttpResponse.json({ success: true, data: { user: mockUser } }),
  ),

  // ── Tasks ────────────────────────────────────────────────────────────────
  http.get('*/tasks', () => HttpResponse.json(mockPaginatedTasks)),

  http.get('*/tasks/:id', ({ params }) => {
    if (params.id === 'nonexistent') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: "Task with id 'nonexistent' not found" },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: mockTask });
  }),

  http.post('*/tasks', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.title) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'title: Title is required' },
        },
        { status: 422 },
      );
    }
    return HttpResponse.json(
      { success: true, data: { ...mockTask, title: body.title as string } },
      { status: 201 },
    );
  }),

  http.patch('*/tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (params.id === 'forbidden') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the task assignee or project owner can update this task',
          },
        },
        { status: 403 },
      );
    }
    return HttpResponse.json({ success: true, data: { ...mockTask, ...body } });
  }),

  http.delete('*/tasks/:id', ({ params }) => {
    if (params.id === 'forbidden') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only the project owner can delete tasks' },
        },
        { status: 403 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Projects ─────────────────────────────────────────────────────────────
  http.get('*/projects', () => HttpResponse.json({ success: true, data: [mockProject] })),

  http.get('*/projects/:id', ({ params }) => {
    if (params.id === 'nonexistent') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: "Project with id 'nonexistent' not found" },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: mockProject });
  }),

  http.post('*/projects', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { success: true, data: { ...mockProject, name: body.name as string } },
      { status: 201 },
    );
  }),

  http.patch('*/projects/:id', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ success: true, data: { ...mockProject, ...body } });
  }),

  http.delete('*/projects/:id', ({ params }) => {
    if (params.id === 'has-tasks') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: "Cannot delete project 'X' because it still has 3 task(s)",
          },
        },
        { status: 403 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
