import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  description?: string;
  /** Controls that belong to the section (range picker, month picker, ...). */
  right?: ReactNode;
}

/** Shared heading for the top-level dashboard sections. */
export function SectionHeading({ id, title, description, right }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-3 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 id={id} className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
