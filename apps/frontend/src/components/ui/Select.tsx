import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { FieldError, FieldLabel } from './field';
import { fieldClassName } from './fieldStyles';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  /** Marks the label with `*`. Named apart from the native `required`. */
  requiredMark?: boolean;
}

/**
 * Native select wearing the same chrome as {@link Input}, so a form no longer
 * has to hand-copy the control classes at every call site.
 */
export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, requiredMark, className = '', id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <FieldLabel htmlFor={selectId} required={requiredMark}>
            {label}
          </FieldLabel>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`${fieldClassName(Boolean(error))} cursor-pointer appearance-none pr-9 ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
        </div>
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    );
  },
);

Select.displayName = 'Select';
