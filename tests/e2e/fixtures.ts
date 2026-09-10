import { test as base, expect, type Page } from '@playwright/test';

/**
 * E2E runs against `next dev` with NO real backend. This fixture intercepts every
 * `/api/**` call (the BFF surface) with an in-memory stub and, on login, seeds
 * the session cookies the proxy + server layout read. `npm run test:e2e`
 * therefore passes with nothing else running.
 *
 * When you wire a real disposable test API, delete `installApiMocks` and point
 * `API_URL` at it instead.
 */
export const mockUser = {
  id: 'user-1',
  email: 'alice@example.com',
  name: 'Alice Smith',
  roles: ['admin'],
};

export const mockProject = {
  id: 'project-1',
  name: 'Website Redesign',
  description: 'Redesign the company website',
  ownerId: mockUser.id,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const baseTask = {
  id: 'task-1',
  title: 'Design mockups',
  description: 'Create Figma mockups',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '2024-06-01T00:00:00.000Z',
  projectId: mockProject.id,
  assigneeId: mockUser.id,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function b64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/** Unsigned JWT with a year-2100 `exp` — enough for the web tier's `exp` check. */
function fakeJwt(): string {
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: mockUser.id, exp: 4102444800 })}.sig`;
}

function paginate<T>(rows: T[]) {
  return {
    success: true,
    data: rows,
    meta: {
      total: rows.length,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

async function installApiMocks(page: Page): Promise<void> {
  let tasks: Array<typeof baseTask> = [{ ...baseTask }];
  let nextId = 2;

  const setSessionCookies = () =>
    page.context().addCookies([
      {
        name: 'access_token',
        value: fakeJwt(),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
      {
        name: 'session_user',
        value: JSON.stringify(mockUser),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);

  await page.route('**/api/auth/login', async (route) => {
    const body = (route.request().postDataJSON() ?? {}) as { email?: string; password?: string };
    if (body.email === 'wrong@example.com' || body.password === 'wrongpassword') {
      return route.fulfill({
        status: 401,
        json: {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
        },
      });
    }
    await setSessionCookies();
    return route.fulfill({ json: { success: true, data: { user: mockUser } } });
  });

  await page.route('**/api/auth/register', async (route) => {
    const body = (route.request().postDataJSON() ?? {}) as { email?: string };
    if (body.email === 'existing@example.com') {
      return route.fulfill({
        status: 409,
        json: {
          success: false,
          error: {
            code: 'CONFLICT',
            message: "Email 'existing@example.com' is already registered",
          },
        },
      });
    }
    await setSessionCookies();
    return route.fulfill({ status: 201, json: { success: true, data: { user: mockUser } } });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await page.context().clearCookies();
    return route.fulfill({ json: { success: true } });
  });

  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { success: true, data: { user: mockUser } } }),
  );

  await page.route('**/api/projects**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { success: true, data: [mockProject] } });
    }
    return route.fulfill({ json: { success: true, data: mockProject } });
  });

  await page.route('**/api/tasks**', (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    if (method === 'GET') {
      return route.fulfill({ json: paginate(tasks) });
    }
    if (method === 'POST') {
      const body = (route.request().postDataJSON() ?? {}) as Partial<typeof baseTask>;
      const created = { ...baseTask, ...body, id: `task-${nextId++}` } as typeof baseTask;
      tasks = [created, ...tasks];
      return route.fulfill({ status: 201, json: { success: true, data: created } });
    }
    if (method === 'PATCH') {
      const id = url.pathname.split('/').pop();
      const body = (route.request().postDataJSON() ?? {}) as Partial<typeof baseTask>;
      tasks = tasks.map((t) => (t.id === id ? { ...t, ...body } : t));
      return route.fulfill({ json: { success: true, data: tasks.find((t) => t.id === id) } });
    }
    if (method === 'DELETE') {
      const id = url.pathname.split('/').pop();
      tasks = tasks.filter((t) => t.id !== id);
      return route.fulfill({ status: 204, body: '' });
    }
    return route.fallback();
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await installApiMocks(page);
    await use(page);
  },
});

export { expect };

/** Drives the real login form; cookies are seeded by the mocked `/api/auth/login`. */
export async function loginAsAlice(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(mockUser.email);
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard/tasks');
}
