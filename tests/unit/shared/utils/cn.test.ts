import { cn } from '@/shared/utils/cn';

/**
 * `cn()` is clsx + tailwind-merge. tailwind-merge must be v3+: v2 predates
 * Tailwind 4's renamed utilities (`shadow-xs`, `outline-hidden`) and would fail
 * to dedupe them, silently letting the losing class win.
 */
describe('cn', () => {
  it('composes conditional classes like clsx', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('resolves conflicting Tailwind utilities, last one wins', () => {
    expect(cn('rounded-md', 'rounded-xl')).toBe('rounded-xl');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('understands Tailwind 4 renamed utilities', () => {
    expect(cn('shadow-xs', 'shadow-lg')).toBe('shadow-lg');
  });

  it('resolves conflicts between our semantic colour tokens', () => {
    expect(cn('bg-card', 'bg-primary')).toBe('bg-primary');
    expect(cn('text-muted-foreground', 'text-foreground')).toBe('text-foreground');
    expect(cn('border-border', 'border-danger')).toBe('border-danger');
  });

  it('keeps non-conflicting utilities', () => {
    expect(cn('flex items-center', 'gap-2')).toBe('flex items-center gap-2');
  });

  it('lets a caller override a component default via className', () => {
    // This is the whole point of cn() over raw clsx.
    expect(cn('bg-primary text-primary-foreground', 'bg-danger')).toBe(
      'text-primary-foreground bg-danger',
    );
  });
});
