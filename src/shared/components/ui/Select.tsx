'use client';

import { forwardRef, SelectHTMLAttributes, useId } from 'react';
import { cn } from '@/shared/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-foreground text-sm font-medium">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-xs',
            'focus:ring-2 focus:ring-offset-0 focus:outline-hidden',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-danger'
              : 'border-border focus:border-ring focus:ring-ring',
            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="text-danger text-xs" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
