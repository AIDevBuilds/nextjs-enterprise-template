'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring disabled:bg-primary/50',
  secondary: 'bg-card text-foreground border border-border hover:bg-accent focus:ring-ring',
  danger:
    'bg-danger text-danger-foreground hover:bg-danger/90 focus:ring-danger disabled:bg-danger/50',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium',
          'transition-colors duration-150 ease-in-out',
          'focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
