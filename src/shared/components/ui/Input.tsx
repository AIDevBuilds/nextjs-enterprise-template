'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-foreground text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-xs',
            'placeholder:text-muted-foreground',
            'focus:ring-2 focus:ring-offset-0 focus:outline-hidden',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-danger'
              : 'border-border focus:border-ring focus:ring-ring',
            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-muted-foreground text-xs">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-danger text-xs" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
