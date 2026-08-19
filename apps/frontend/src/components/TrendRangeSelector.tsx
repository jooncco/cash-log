import { endOfMonth, format, startOfMonth, startOfYear, subMonths } from 'date-fns';
import type { DateRange } from '../types';
import type { TranslationKey } from '../lib/i18n';

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  t: (key: TranslationKey) => string;
}

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

/**
 * Presets are resolved against "today" on every render so a long-lived tab
 * cannot drift onto a stale window.
 */
function presets(): { key: TranslationKey; range: DateRange }[] {
  const today = new Date();
  const end = iso(endOfMonth(today));
  return [
    // An empty range means "no bounds", which the API resolves to the full history.
    { key: 'allTime', range: {} },
    { key: 'last6Months', range: { startDate: iso(startOfMonth(subMonths(today, 5))), endDate: end } },
    { key: 'last12Months', range: { startDate: iso(startOfMonth(subMonths(today, 11))), endDate: end } },
    { key: 'thisYear', range: { startDate: iso(startOfYear(today)), endDate: end } },
  ];
}

export function TrendRangeSelector({ value, onChange, t }: Props) {
  const isActive = (range: DateRange) =>
    (range.startDate ?? '') === (value.startDate ?? '') && (range.endDate ?? '') === (value.endDate ?? '');

  return (
    <div className="flex flex-wrap items-center gap-1.5" data-testid="trend-range-selector">
      {presets().map(({ key, range }) => (
        <button
          key={key}
          onClick={() => onChange(range)}
          aria-pressed={isActive(range)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ease-smooth ${
            isActive(range)
              ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-500/50 dark:bg-brand-900/30 dark:text-brand-300'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800'
          }`}
          data-testid={`trend-range-${key}`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
