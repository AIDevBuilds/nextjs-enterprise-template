import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { mockTask, mockProject } from '@tests/fixtures';
import { renderWithProviders } from '@tests/utils/render';
import '../../../mocks/server';
import { server } from '../../../mocks/server';

describe('TaskForm', () => {
  it('renders all form fields', () => {
    renderWithProviders(<TaskForm defaultProjectId={mockProject.id} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it('shows the create button in create mode', () => {
    renderWithProviders(<TaskForm />);
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('shows the save button in edit mode', () => {
    renderWithProviders(<TaskForm task={mockTask} />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('prefills form values in edit mode', () => {
    renderWithProviders(<TaskForm task={mockTask} />);
    expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
  });

  it('shows a translated validation error when title is empty', async () => {
    renderWithProviders(<TaskForm />);
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('calls the create mutation on successful submit', async () => {
    const onSuccess = jest.fn();
    renderWithProviders(<TaskForm defaultProjectId={mockProject.id} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'New Test Task');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('keeps the form usable on server failure', async () => {
    server.use(
      http.post('*/tasks', () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'title: Title is required' },
          },
          { status: 422 },
        ),
      ),
    );

    renderWithProviders(<TaskForm defaultProjectId={mockProject.id} />);
    await userEvent.type(screen.getByLabelText(/title/i), 'Fail');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });
  });
});
