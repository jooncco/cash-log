import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from './ui/Card';
import type { Transaction } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
  title: string;
  noDataLabel: string;
  theme?: 'light' | 'dark';
}

export function CategoryPieChart({ transactions, title, noDataLabel, theme = 'light' }: Props) {
  const expenses = transactions.filter((t) => t.transactionType === 'EXPENSE');
  const grouped = new Map<string, { amount: number; color: string }>();

  for (const tx of expenses) {
    const name = tx.category?.name ?? 'Unknown';
    const color = tx.category?.color ?? '#6b7280';
    const prev = grouped.get(name) ?? { amount: 0, color };
    grouped.set(name, { amount: prev.amount + tx.amountKrw, color });
  }

  if (grouped.size === 0) {
    return (
      <Card>
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500">{noDataLabel}</p>
      </Card>
    );
  }

  const labels = [...grouped.keys()];
  const data = {
    labels,
    datasets: [
      {
        data: labels.map((l) => grouped.get(l)!.amount),
        backgroundColor: labels.map((l) => grouped.get(l)!.color),
      },
    ],
  };

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="relative h-72">
        <Pie data={data} options={{ responsive: true, maintainAspectRatio: false, layout: { padding: { right: 8 } }, plugins: { legend: { position: 'right', align: 'center', labels: { color: theme === 'dark' ? '#e5e7eb' : '#374151', font: { size: 13 }, padding: 12 } } } }} />
      </div>
    </Card>
  );
}
