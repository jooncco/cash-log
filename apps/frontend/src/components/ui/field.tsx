import { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  /** Renders the `*` marker; every field without it reads as optional. */
  required?: boolean;
  htmlFor?: string;
}

export function FieldLabel({ children, required, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export function FieldError({ children, id }: { children?: string; id?: string }) {
  if (!children) return null;
  return (
    <span id={id} role="alert" className="text-xs text-red-500">
      {children}
    </span>
  );
}
