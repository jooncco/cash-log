interface Props {
  value: 'INCOME' | 'EXPENSE';
  onChange: (value: 'INCOME' | 'EXPENSE') => void;
  incomeLabel: string;
  expenseLabel: string;
}

/**
 * Small income/expense segmented toggle, used by the dashboard breakdown
 * charts so users can inspect income analytics, not just expenses (CL-013).
 */
export function TypeToggle({ value, onChange, incomeLabel, expenseLabel }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-700" data-testid="type-toggle">
      <button
        onClick={() => onChange('EXPENSE')}
        className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
          value === 'EXPENSE'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        data-testid="type-toggle-expense"
      >
        {expenseLabel}
      </button>
      <button
        onClick={() => onChange('INCOME')}
        className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
          value === 'INCOME'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        data-testid="type-toggle-income"
      >
        {incomeLabel}
      </button>
    </div>
  );
}
