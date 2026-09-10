'use client';

import { forwardRef, TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/shared/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-xs',
            'placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-danger'
              : 'border-border focus:border-ring focus:ring-ring',
            'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
