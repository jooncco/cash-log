import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from './ui/Card';
import { TypeToggle } from './ui/TypeToggle';
import { useCategoryBreakdown } from '../lib/queries/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  year: number;
  month: number;
  title: string;
  noDataLabel: string;
  incomeLabel: string;
  expenseLabel: string;
  theme?: 'light' | 'dark';
}

export function CategoryPieChart({ year, month, title, noDataLabel, incomeLabel, expenseLabel, theme = 'light' }: Props) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const { data: breakdown = [] } = useCategoryBreakdown(year, month, type);

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
        <Pie data={data} options={{ responsive: true, maintainAspectRatio: false, layout: { padding: { right: 8 } }, plugins: { legend: { position: 'right', align: 'center', labels: { color: theme === 'dark' ? '#e5e7eb' : '#374151', font: { size: 13 }, padding: 12 } } } }} />
      </div>
    </Card>
  );
}
