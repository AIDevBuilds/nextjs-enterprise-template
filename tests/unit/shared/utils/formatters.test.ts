import { EMPTY_VALUE, formatDate, formatRelative } from '@/shared/utils/formatters';

describe('formatDate', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2024-06-01T00:00:00.000Z')).toMatch(/Jun 1, 2024/);
  });

  it('returns the empty marker for null/undefined/invalid input', () => {
    expect(formatDate(null)).toBe(EMPTY_VALUE);
    expect(formatDate(undefined)).toBe(EMPTY_VALUE);
    expect(formatDate('not-a-date')).toBe(EMPTY_VALUE);
  });
});

describe('formatRelative', () => {
  it('returns a relative string for a valid date', () => {
    expect(formatRelative(new Date().toISOString())).toMatch(/ago|less than/i);
  });

  it('returns the empty marker for null/invalid input', () => {
    expect(formatRelative(null)).toBe(EMPTY_VALUE);
    expect(formatRelative('nope')).toBe(EMPTY_VALUE);
  });
});
