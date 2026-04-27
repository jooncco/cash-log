import { Card } from './ui/Card';

interface Props {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
}

export function MonthlySummaryCard({ title, amount, type }: Props) {
  const color =
    type === 'balance'
      ? amount >= 0
        ? 'text-green-500'
        : 'text-red-500'
      : 'text-gray-900 dark:text-white';

  return (
    <Card>
      <p className="text-sm text-gray-500 dark:text-gray-300">{title}</p>
      <p className={`mt-1 text-2xl font-bold text-right ${color}`}>
        {amount.toLocaleString()}원
      </p>
    </Card>
  );
}
