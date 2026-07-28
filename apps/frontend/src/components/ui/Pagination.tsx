import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  totalLabel: string;
  pageLabel: string;
}

/** 0-indexed page controls used by the paginated transactions list. */
export function Pagination({ page, totalPages, totalElements, onPageChange, totalLabel, pageLabel }: Props) {
  if (totalPages <= 1 && totalElements === 0) return null;

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400" data-testid="pagination">
      <span data-testid="pagination-total">{totalLabel}: {totalElements.toLocaleString()}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="rounded-lg p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700"
          aria-label="Previous page"
          data-testid="pagination-prev"
        >
          <ChevronLeft size={16} />
        </button>
        <span data-testid="pagination-page">{pageLabel} {page + 1} / {Math.max(totalPages, 1)}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="rounded-lg p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700"
          aria-label="Next page"
          data-testid="pagination-next"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
