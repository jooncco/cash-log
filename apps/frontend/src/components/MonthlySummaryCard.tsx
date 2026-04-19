import { Card } from './ui/Card';

interface Props {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
}

const colors = {
  income: 'text-green-600',
  expense: 'text-red-600',
  balance: 'text-gray-900 dark:text-white',
};

export function MonthlySummaryCard({ title, amount, type }: Props) {
  return (
    <Card>
      <p className="text-sm text-gray-500 dark:text-gray-300">{title}</p>
      <p className={`mt-1 text-2xl font-bold text-right ${colors[type]}`}>
        {amount.toLocaleString()}원
      </p>
    </Card>
  );
}
