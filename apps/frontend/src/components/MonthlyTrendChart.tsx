import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type Plugin,
} from 'chart.js';
import { Card } from './ui/Card';
import type { Transaction } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
  title: string;
  incomeLabel: string;
  expenseLabel: string;
  theme?: 'light' | 'dark';
  onMonthClick?: (month: string) => void;
}

const crosshairPlugin: Plugin = {
  id: 'crosshair',
  afterDraw(chart) {
    const tooltip = chart.tooltip;
    if (!tooltip || !tooltip.getActiveElements().length) return;
    const x = tooltip.getActiveElements()[0].element.x;
    const { top, bottom } = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#9ca3af';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  },
};

export function MonthlyTrendChart({ transactions, title, incomeLabel, expenseLabel, theme = 'light', onMonthClick }: Props) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const monthly = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    const month = tx.transactionDate.slice(0, 7);
    const prev = monthly.get(month) ?? { income: 0, expense: 0 };
    if (tx.transactionType === 'INCOME') prev.income += tx.amountKrw;
    else prev.expense += tx.amountKrw;
    monthly.set(month, prev);
  }

  const labels = [...monthly.keys()].sort();
  const data = {
    labels,
    datasets: [
      {
        label: incomeLabel,
        data: labels.map((l) => monthly.get(l)?.income ?? 0),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e20',
        tension: 0.3,
      },
      {
        label: expenseLabel,
        data: labels.map((l) => monthly.get(l)?.expense ?? 0),
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        tension: 0.3,
      },
    ],
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current || !onMonthClick) return;
    const elements = chartRef.current.getElementsAtEventForMode(e.nativeEvent, 'index', { intersect: false }, false);
    if (elements.length > 0) {
      onMonthClick(labels[elements[0].index]);
    }
  };

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{title}</h3>
      <Line ref={chartRef} data={data} onClick={handleClick} plugins={[crosshairPlugin]} options={{
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        hover: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom', labels: { color: theme === 'dark' ? '#e5e7eb' : '#374151' } }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }, grid: { color: theme === 'dark' ? '#374151' : '#e5e7eb' } },
          y: { ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }, grid: { color: theme === 'dark' ? '#374151' : '#e5e7eb' } },
        },
      }} />
    </Card>
  );
}
