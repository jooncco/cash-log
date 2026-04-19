import { useCategoryStore } from '../lib/stores/categoryStore';
import { useTagStore } from '../lib/stores/tagStore';
import type { TransactionFilterParams } from '../types';
import type { TranslationKey } from '../lib/i18n';

interface Props {
  filters: TransactionFilterParams;
  onChange: (f: Partial<TransactionFilterParams>) => void;
  onClear: () => void;
  t: (key: TranslationKey) => string;
}

export function TransactionFilters({ filters, onChange, onClear, t }: Props) {
  const { categories } = useCategoryStore();
  const { tags } = useTagStore();

  const activeCount = [filters.startDate, filters.endDate, filters.type, filters.categoryId, filters.tagId].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-end gap-3" data-testid="transaction-filters">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{t('startDate')}</label>
        <input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) => onChange({ startDate: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          data-testid="filter-start-date"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{t('endDate')}</label>
        <input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) => onChange({ endDate: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          data-testid="filter-end-date"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{t('type')}</label>
        <select
          value={filters.type ?? ''}
          onChange={(e) => onChange({ type: (e.target.value || undefined) as TransactionFilterParams['type'] })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          data-testid="filter-type"
        >
          <option value="">All</option>
          <option value="INCOME">{t('income')}</option>
          <option value="EXPENSE">{t('expense')}</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{t('category')}</label>
        <select
          value={filters.categoryId ?? ''}
          onChange={(e) => onChange({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          data-testid="filter-category"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{t('tags')}</label>
        <select
          value={filters.tagId ?? ''}
          onChange={(e) => onChange({ tagId: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          data-testid="filter-tag"
        >
          <option value="">All</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
          data-testid="clear-filters"
        >
          {t('clearFilters')} ({activeCount})
        </button>
      )}
    </div>
  );
}
