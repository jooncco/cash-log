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

function toggleId(ids: number[] | undefined, id: number): number[] {
  const arr = ids ?? [];
  return arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id];
}

export function TransactionFilters({ filters, onChange, onClear, t }: Props) {
  const { categories } = useCategoryStore();
  const { tags } = useTagStore();

  const activeCount = [filters.startDate, filters.endDate, filters.type].filter(Boolean).length + (filters.categoryIds?.length ?? 0) + (filters.tagIds?.length ?? 0);

  return (
    <div className="space-y-3" data-testid="transaction-filters">
      {/* 날짜 + 유형 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('startDate')}</label>
          <input type="date" value={filters.startDate ?? ''} onChange={(e) => onChange({ startDate: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" data-testid="filter-start-date" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('endDate')}</label>
          <input type="date" value={filters.endDate ?? ''} onChange={(e) => onChange({ endDate: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" data-testid="filter-end-date" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('type')}</label>
          <select value={filters.type ?? ''} onChange={(e) => onChange({ type: (e.target.value || undefined) as TransactionFilterParams['type'] })}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" data-testid="filter-type">
            <option value="">All</option>
            <option value="INCOME">{t('income')}</option>
            <option value="EXPENSE">{t('expense')}</option>
          </select>
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="ml-auto rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200" data-testid="clear-filters">
            {t('clearFilters')} ({activeCount})
          </button>
        )}
      </div>

      {/* 카테고리 뱃지 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500 mr-1">{t('category')}</span>
          {categories.map((c) => {
            const active = filters.categoryIds?.includes(c.id);
            return (
              <button key={c.id} onClick={() => onChange({ categoryIds: toggleId(filters.categoryIds, c.id) })}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${active ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-300 text-gray-600 opacity-50 dark:border-gray-600 dark:text-gray-400'}`}
                data-testid={`filter-cat-${c.id}`}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 태그 뱃지 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500 mr-1">{t('tags')}</span>
          {tags.map((tag) => {
            const active = filters.tagIds?.includes(tag.id);
            return (
              <button key={tag.id} onClick={() => onChange({ tagIds: toggleId(filters.tagIds, tag.id) })}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${active ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30' : 'border-gray-300 opacity-50 dark:border-gray-600'}`}
                style={{ color: tag.color }}
                data-testid={`filter-tag-${tag.id}`}>
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
