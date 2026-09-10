import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { setLogTransports } from '@/shared/lib/observability/logger';
import type { LogRecord } from '@/shared/lib/observability/types';
import { renderWithProviders } from '@tests/utils/render';

function Boom({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) throw new Error('kaboom');
  return <p>recovered</p>;
}

let records: LogRecord[] = [];
let consoleError: jest.SpyInstance;

beforeEach(() => {
  records = [];
  setLogTransports([(record) => records.push(record)]);
  // React logs caught errors to console.error; keep test output readable.
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('renders the translated fallback and reports the error', () => {
    renderWithProviders(
      <ErrorBoundary boundary="TestWidget">
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This section could not be displayed');

    const reported = records.find((r) => r.level === 'error');
    expect(reported?.error?.message).toBe('kaboom');
    expect(reported?.context).toMatchObject({ boundary: 'TestWidget' });
  });

  it('supports a custom fallback', () => {
    renderWithProviders(
      <ErrorBoundary fallback={(error) => <p>custom: {error.message}</p>}>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom: kaboom')).toBeInTheDocument();
  });

  it('clears the error when reset is pressed', async () => {
    function Wrapper() {
      return (
        <ErrorBoundary>
          <Boom shouldThrow={false} />
        </ErrorBoundary>
      );
    }

    const { rerender } = renderWithProviders(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    rerender(<Wrapper />);

    expect(screen.getByText('recovered')).toBeInTheDocument();
  });
});
