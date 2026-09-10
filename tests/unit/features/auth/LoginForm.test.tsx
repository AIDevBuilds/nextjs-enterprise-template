import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { renderWithProviders } from '@tests/utils/render';
import '../../../mocks/server';
import { server } from '../../../mocks/server';

const replace = jest.fn();
const refresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh, push: jest.fn() }),
}));

beforeEach(() => {
  replace.mockClear();
  refresh.mockClear();
});

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows a translated validation error when email is empty', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      // Proves the Zod message key was resolved through the message catalogue.
      expect(screen.getByText('Must be a valid email address')).toBeInTheDocument();
    });
  });

  it('shows the API error message on failed login', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } },
          { status: 401 },
        ),
      ),
    );

    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'badpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });
  });

  it('navigates to the dashboard on successful login', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/dashboard/tasks');
    });
  });
});
