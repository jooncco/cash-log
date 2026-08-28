interface Props {
  value: 'INCOME' | 'EXPENSE';
  onChange: (value: 'INCOME' | 'EXPENSE') => void;
  incomeLabel: string;
  expenseLabel: string;
  size?: 'sm' | 'md';
  /** Stretches the toggle to the container width, for use as a form field. */
  fullWidth?: boolean;
  testId?: string;
}

const sizeClass: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
};

/**
 * Income/expense segmented toggle. Used by the dashboard breakdown charts so
 * users can inspect income analytics (CL-013), and by the transaction form in
 * place of a native select so the red/green colour language stays consistent.
 */
export function TypeToggle({
  value,
  onChange,
  incomeLabel,
  expenseLabel,
  size = 'sm',
  fullWidth = false,
  testId = 'type-toggle',
}: Props) {
  const button = `rounded-md font-medium transition-colors ${sizeClass[size]} ${fullWidth ? 'flex-1' : ''}`;
  return (
    <div
      className={`${fullWidth ? 'flex w-full' : 'inline-flex'} rounded-lg border border-gray-200 p-0.5 dark:border-gray-700`}
      role="group"
      data-testid={testId}
    >
      <button
        type="button"
        onClick={() => onChange('EXPENSE')}
        aria-pressed={value === 'EXPENSE'}
        className={`${button} ${
          value === 'EXPENSE'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        data-testid={`${testId}-expense`}
      >
        {expenseLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('INCOME')}
        aria-pressed={value === 'INCOME'}
        className={`${button} ${
          value === 'INCOME'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        data-testid={`${testId}-income`}
      >
        {incomeLabel}
      </button>
    </div>
  );
}
