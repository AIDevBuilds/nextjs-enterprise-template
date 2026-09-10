import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { mockProject } from '@tests/fixtures';
import { renderWithProviders } from '@tests/utils/render';

describe('ProjectCard', () => {
  it('renders project name and description', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    expect(screen.getByText(mockProject.description!)).toBeInTheDocument();
  });

  it('pluralises the task count', () => {
    renderWithProviders(<ProjectCard project={mockProject} taskCount={5} />);
    expect(screen.getByText(/5 tasks/i)).toBeInTheDocument();
  });

  it('uses the singular form for one task', () => {
    renderWithProviders(<ProjectCard project={mockProject} taskCount={1} />);
    expect(screen.getByText(/1 task$/i)).toBeInTheDocument();
  });

  it('renders the created date', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = jest.fn();
    renderWithProviders(<ProjectCard project={mockProject} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete project/i }));
    expect(onDelete).toHaveBeenCalledWith(mockProject);
  });

  it('calls onEdit when Edit is clicked', async () => {
    const onEdit = jest.fn();
    renderWithProviders(<ProjectCard project={mockProject} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: /edit project/i }));
    expect(onEdit).toHaveBeenCalledWith(mockProject);
  });

  it('hides action buttons when no handlers provided', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});
