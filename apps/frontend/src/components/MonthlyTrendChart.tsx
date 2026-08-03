import { useRef, useCallback } from 'react';
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
  Filler,
  type Plugin,
  type ChartEvent,
  type ActiveElement,
} from 'chart.js';
import { Card } from './ui/Card';
import type { Transaction } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  transactions: Transaction[];
  title: string;
  incomeLabel: string;
  expenseLabel: string;
  theme?: 'light' | 'dark';
  onMonthClick?: (month: string) => void;
}

function formatKrw(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`;
}

function formatKrwAbbreviated(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100_000_000) return `${Math.round(value / 100_000_000)}억`;
  if (abs >= 10_000) return `${Math.round(value / 10_000)}만`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}천`;
  return String(value);
}

function createCrosshairPlugin(theme: 'light' | 'dark'): Plugin {
  return {
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
      ctx.strokeStyle = theme === 'dark' ? '#6b7280' : '#9ca3af';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    },
  };
}

const gradientPlugin: Plugin = {
  id: 'gradientFill',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const { top, bottom } = chartArea;

    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.visible) return;

      const baseColor = i === 0 ? { r: 34, g: 197, b: 94 } : { r: 239, g: 68, b: 68 };
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.25)`);
      gradient.addColorStop(0.5, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.08)`);
      gradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.01)`);

      dataset.backgroundColor = gradient;
    });
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
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#22c55e',
        pointHoverBorderColor: theme === 'dark' ? '#e5e7eb' : '#ffffff',
        pointHoverBorderWidth: 3,
      },
      {
        label: expenseLabel,
        data: labels.map((l) => monthly.get(l)?.expense ?? 0),
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#ef4444',
        pointHoverBorderColor: theme === 'dark' ? '#e5e7eb' : '#ffffff',
        pointHoverBorderWidth: 3,
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

  const handleHover = useCallback(
    (_event: ChartEvent, elements: ActiveElement[], chart: ChartJS) => {
      const canvas = chart.canvas;
      if (onMonthClick && elements.length > 0) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    },
    [onMonthClick],
  );

  const crosshairPlugin = createCrosshairPlugin(theme);

  return (
    <Card>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <Line
        ref={chartRef}
        data={data}
        onClick={handleClick}
        plugins={[crosshairPlugin, gradientPlugin]}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          hover: { mode: 'index', intersect: false },
          onHover: handleHover,
          animations: {
            tension: {
              duration: 800,
              easing: 'easeInOutQuad',
              from: 0,
              to: 0.3,
            },
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: theme === 'dark' ? '#e5e7eb' : '#374151',
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 16,
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
              bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
              footerColor: theme === 'dark' ? '#e5e7eb' : '#111827',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              boxPadding: 6,
              usePointStyle: true,
              callbacks: {
                title(items) {
                  if (!items.length) return '';
                  return items[0].label;
                },
                label(context) {
                  const label = context.dataset.label ?? '';
                  const value = context.parsed.y ?? 0;
                  return ` ${label}: ${formatKrw(value)}`;
                },
                footer(items) {
                  const total = items.reduce((sum, item) => sum + (item.parsed.y ?? 0), 0);
                  return `합계: ${formatKrw(total)}`;
                },
              },
              footerFont: { weight: 'bold' },
            },
            filler: {
              propagate: false,
            },
          },
          scales: {
            x: {
              ticks: {
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                font: { size: 11 },
              },
              grid: {
                color: theme === 'dark' ? '#374151' : '#f3f4f6',
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                font: { size: 11 },
                callback(tickValue) {
                  const value = typeof tickValue === 'number' ? tickValue : Number(tickValue);
                  return formatKrwAbbreviated(value);
                },
              },
              grid: {
                color: theme === 'dark' ? '#374151' : '#f3f4f6',
              },
            },
          },
        }}
      />
    </Card>
  );
}
