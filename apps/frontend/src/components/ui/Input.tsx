import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <input
        ref={ref}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all duration-150 ease-smooth placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
          error
            ? 'border-red-400 focus:border-red-500 dark:border-red-500/60'
            : 'border-gray-300 focus:border-brand-500 dark:border-gray-600 dark:focus:border-brand-400'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  ),
);

Input.displayName = 'Input';
