import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, TooltipItem } from 'chart.js';
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

function formatKRW(value: number): string {
  if (value >= 100_000_000) return `${Math.round(value / 100_000_000)}억`;
  if (value >= 10_000_000) return `${Math.round(value / 10_000)}만`;
  if (value >= 10_000) return `${Math.round(value / 10_000)}만`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}천`;
  return String(value);
}

function adjustColorBrightness(hex: string, percent: number): string {
  // Make a color lighter (positive percent) or darker (negative percent)
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `rgb(${r}, ${g}, ${b})`;
}

export function TagPieChart({ year, month, title, noDataLabel, incomeLabel, expenseLabel, theme = 'light' }: Props) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const { data: breakdown = [] } = useTagBreakdown(year, month, type);

  // Sort by amount descending (largest at top in horizontal bar)
  const sorted = useMemo(
    () => [...breakdown].sort((a, b) => b.amount - a.amount),
    [breakdown],
  );

  const total = useMemo(
    () => sorted.reduce((sum, b) => sum + b.amount, 0),
    [sorted],
  );

  const header = (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <TypeToggle value={type} onChange={setType} incomeLabel={incomeLabel} expenseLabel={expenseLabel} />
    </div>
  );

  if (sorted.length === 0) {
    return (
      <Card>
        {header}
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{noDataLabel}</p>
      </Card>
    );
  }

  const data = {
    labels: sorted.map((b) => b.name),
    datasets: [
      {
        data: sorted.map((b) => b.amount),
        backgroundColor: sorted.map((b) => b.color),
        hoverBackgroundColor: sorted.map((b) =>
          adjustColorBrightness(b.color, theme === 'dark' ? 40 : 30),
        ),
        borderRadius: 6,
        maxBarThickness: 32,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      delay: (context) => {
        if (context.type === 'data' && context.mode === 'default') {
          return context.dataIndex * 80;
        }
        return 0;
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => items[0]?.label ?? '',
          label: (item: TooltipItem<'bar'>) => {
            const amount = item.raw as number;
            const formatted = `₩${amount.toLocaleString('ko-KR')}`;
            const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
            return `${formatted} (${pct}%)`;
          },
        },
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          callback: (value) => formatKRW(Number(value)),
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
          lineWidth: 1,
          // @ts-expect-error -- Chart.js supports borderDash on grid
          borderDash: [4, 4],
        },
        border: { display: false },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  // Dynamic height: ensure enough space per bar (min 280px)
  const chartHeight = Math.max(280, sorted.length * 40);

  return (
    <Card>
      {header}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
}
