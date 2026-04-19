import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Card } from './ui/Card';
import type { Transaction } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
  title: string;
  noDataLabel: string;
  theme?: 'light' | 'dark';
}

export function TagPieChart({ transactions, title, noDataLabel, theme = 'light' }: Props) {
  const grouped = new Map<string, { amount: number; color: string }>();

  for (const tx of transactions) {
    for (const tag of tx.tags) {
      const prev = grouped.get(tag.name) ?? { amount: 0, color: tag.color };
      grouped.set(tag.name, { amount: prev.amount + tx.amountKrw, color: prev.color });
    }
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
        <Bar data={data} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }, grid: { display: false } },
            y: { ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }, grid: { color: theme === 'dark' ? '#374151' : '#e5e7eb' } },
          },
        }} />
      </div>
    </Card>
  );
}
