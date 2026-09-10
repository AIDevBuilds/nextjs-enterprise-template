import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { mockTask } from '@tests/fixtures';
import { renderWithProviders } from '@tests/utils/render';

describe('TaskCard', () => {
  it('renders title and description', () => {
    renderWithProviders(<TaskCard task={mockTask} />);
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description!)).toBeInTheDocument();
  });

  it('renders the translated status badge', () => {
    renderWithProviders(<TaskCard task={mockTask} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders the translated priority badge', () => {
    renderWithProviders(<TaskCard task={mockTask} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders due date when present', () => {
    renderWithProviders(<TaskCard task={mockTask} />);
    expect(screen.getByText(/due/i)).toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', async () => {
    const onEdit = jest.fn();
    renderWithProviders(<TaskCard task={mockTask} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = jest.fn();
    renderWithProviders(<TaskCard task={mockTask} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete task/i }));
    expect(onDelete).toHaveBeenCalledWith(mockTask);
  });

  it('hides action buttons when no handlers are provided', () => {
    renderWithProviders(<TaskCard task={mockTask} />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
