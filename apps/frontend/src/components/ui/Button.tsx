import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md';

const styles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-elevate hover:bg-brand-700 active:bg-brand-800 disabled:hover:bg-brand-600',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600',
  danger:
    'bg-red-600 text-white shadow-elevate hover:bg-red-700 active:bg-red-800 disabled:hover:bg-red-600',
  ghost:
    'text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading = false, className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:focus-visible:ring-offset-gray-900 ${styles[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
