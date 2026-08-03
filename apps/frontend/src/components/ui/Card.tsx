import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Removes default padding, useful when a child needs full-bleed content (e.g. tables). */
  noPadding?: boolean;
  /** Adds a subtle hover lift, useful for clickable/interactive cards. */
  interactive?: boolean;
}

export function Card({ children, className = '', noPadding = false, interactive = false }: Props) {
  return (
    <div
      className={`rounded-xl2 border border-gray-200/80 bg-white shadow-elevate transition-shadow duration-200 ease-smooth dark:border-gray-800 dark:bg-gray-900 dark:shadow-elevate-dark ${
        interactive ? 'hover:shadow-elevate-lg dark:hover:shadow-elevate-lg-dark' : ''
      } ${noPadding ? '' : 'p-5 sm:p-6'} ${className}`}
    >
      {children}
    </div>
  );
}
