import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Card } from './ui/Card';
import { TypeToggle } from './ui/TypeToggle';
import { useTagBreakdown } from '../lib/queries/analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  year: number;
  month: number;
  title: string;
  noDataLabel: string;
  incomeLabel: string;
  expenseLabel: string;
  theme?: 'light' | 'dark';
}

export function TagPieChart({ year, month, title, noDataLabel, incomeLabel, expenseLabel, theme = 'light' }: Props) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const { data: breakdown = [] } = useTagBreakdown(year, month, type);

  const header = (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <TypeToggle value={type} onChange={setType} incomeLabel={incomeLabel} expenseLabel={expenseLabel} />
    </div>
  );

  if (breakdown.length === 0) {
    return (
      <Card>
        {header}
        <p className="text-sm text-gray-500">{noDataLabel}</p>
      </Card>
    );
  }

  const data = {
    labels: breakdown.map((b) => b.name),
    datasets: [
      {
        data: breakdown.map((b) => b.amount),
        backgroundColor: breakdown.map((b) => b.color),
      },
    ],
  };

  return (
    <Card>
      {header}
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
