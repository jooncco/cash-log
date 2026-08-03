import { FilterX } from 'lucide-react';
import { useCategories } from '../lib/queries/categories';
import { useTags } from '../lib/queries/tags';
import { Button } from './ui/Button';
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
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  const activeCount = [filters.startDate, filters.endDate, filters.type].filter(Boolean).length + (filters.categoryIds?.length ?? 0) + (filters.tagIds?.length ?? 0);

  return (
    <div className="space-y-3 rounded-xl2 bg-gray-50 p-4 dark:bg-gray-800/40" data-testid="transaction-filters">
      {/* 날짜 + 유형 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('startDate')}</label>
          <input type="date" value={filters.startDate ?? ''} onChange={(e) => onChange({ startDate: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/20" data-testid="filter-start-date" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('endDate')}</label>
          <input type="date" value={filters.endDate ?? ''} onChange={(e) => onChange({ endDate: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/20" data-testid="filter-end-date" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('type')}</label>
          <select value={filters.type ?? ''} onChange={(e) => onChange({ type: (e.target.value || undefined) as TransactionFilterParams['type'] })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/20" data-testid="filter-type">
            <option value="">All</option>
            <option value="INCOME">{t('income')}</option>
            <option value="EXPENSE">{t('expense')}</option>
          </select>
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto" data-testid="clear-filters">
            <FilterX size={16} /> {t('clearFilters')} ({activeCount})
          </Button>
        )}
      </div>

      {/* 카테고리 뱃지 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-gray-500 dark:text-gray-400">{t('category')}</span>
          {categories.map((c) => {
            const active = filters.categoryIds?.includes(c.id);
            return (
              <button key={c.id} onClick={() => onChange({ categoryIds: toggleId(filters.categoryIds, c.id) })}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-150 ease-smooth ${active ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-500/50 dark:bg-brand-900/30 dark:text-brand-300' : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-white dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800'}`}
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
          <span className="mr-1 text-xs font-medium text-gray-500 dark:text-gray-400">{t('tags')}</span>
          {tags.map((tag) => {
            const active = filters.tagIds?.includes(tag.id);
            return (
              <button key={tag.id} onClick={() => onChange({ tagIds: toggleId(filters.tagIds, tag.id) })}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-150 ease-smooth ${active ? 'border-brand-300 bg-brand-50 shadow-sm dark:border-brand-500/50 dark:bg-brand-900/30' : 'border-gray-300 hover:border-gray-400 hover:bg-white dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800'}`}
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
