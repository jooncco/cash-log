import { useMemo } from 'react';
import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type Plugin } from 'chart.js';
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

function formatKRW(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`;
}

export function CategoryPieChart({ year, month, title, noDataLabel, incomeLabel, expenseLabel, theme = 'light' }: Props) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const { data: breakdown = [] } = useCategoryBreakdown(year, month, type);

  const total = useMemo(() => breakdown.reduce((sum, b) => sum + b.amount, 0), [breakdown]);

  // Center label plugin: renders total amount in the doughnut hole
  const centerLabelPlugin: Plugin<'doughnut'> = useMemo(
    () => ({
      id: 'centerLabel',
      afterDraw(chart) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // "합계" or "Total" small label
        ctx.font = '12px sans-serif';
        ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280';
        ctx.fillText('합계', centerX, centerY - 12);

        // Total amount
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = theme === 'dark' ? '#f3f4f6' : '#111827';
        ctx.fillText(formatKRW(total), centerX, centerY + 8);

        ctx.restore();
      },
    }),
    [theme, total],
  );

  const header = (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <TypeToggle value={type} onChange={setType} incomeLabel={incomeLabel} expenseLabel={expenseLabel} />
    </div>
  );

  if (breakdown.length === 0) {
    return (
      <Card>
        {header}
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{noDataLabel}</p>
      </Card>
    );
  }

  const data = {
    labels: breakdown.map((b) => b.name),
    datasets: [
      {
        data: breakdown.map((b) => b.amount),
        backgroundColor: breakdown.map((b) => b.color),
        borderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    layout: {
      padding: { right: 8 },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          font: { size: 13 },
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels(chart: ChartJS<'doughnut'>) {
            const dataset = chart.data.datasets[0];
            const dataValues = dataset.data as number[];
            const dataTotal = dataValues.reduce((sum, val) => sum + val, 0);

            return (chart.data.labels as string[]).map((label, i) => {
              const value = dataValues[i];
              const pct = dataTotal > 0 ? ((value / dataTotal) * 100).toFixed(1) : '0.0';
              return {
                text: `${label} (${pct}%)`,
                fontColor: theme === 'dark' ? '#e5e7eb' : '#374151',
                fillStyle: (dataset.backgroundColor as string[])[i],
                strokeStyle: theme === 'dark' ? '#1f2937' : '#ffffff',
                lineWidth: 1,
                hidden: false,
                index: i,
                pointStyle: 'circle' as const,
              };
            });
          },
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
        titleColor: theme === 'dark' ? '#f9fafb' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#4b5563',
        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title(items: { label?: string }[]) {
            return items[0]?.label ?? '';
          },
          label(item: { raw: unknown; dataset: { data: unknown[] } }) {
            const value = item.raw as number;
            const dataValues = item.dataset.data as number[];
            const tooltipTotal = dataValues.reduce((sum, v) => sum + v, 0);
            const pct = tooltipTotal > 0 ? ((value / tooltipTotal) * 100).toFixed(1) : '0.0';
            return `${formatKRW(value)}  (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      {header}
      <div className="relative h-72">
        <Doughnut data={data} options={options} plugins={[centerLabelPlugin]} />
      </div>
    </Card>
  );
}
