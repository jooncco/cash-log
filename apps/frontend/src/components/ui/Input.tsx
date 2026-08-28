import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { FieldError, FieldLabel } from './field';
import { fieldClassName } from './fieldStyles';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Helper text shown under the control while there is no error to show. */
  hint?: string;
  /** Marks the label with `*`. Named apart from the native `required`. */
  requiredMark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, requiredMark, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <FieldLabel htmlFor={inputId} required={requiredMark}>
            {label}
          </FieldLabel>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${fieldClassName(Boolean(error))} ${className}`}
          {...props}
        />
        {hint && !error && <span className="text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    );
  },
);

Input.displayName = 'Input';
