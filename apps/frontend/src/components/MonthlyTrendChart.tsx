import { useCallback, useMemo, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type Chart,
  type Plugin,
  type ChartEvent,
  type ActiveElement,
} from 'chart.js';
import { Card } from './ui/Card';
import type { MonthlyTrendPoint } from '../types';
import type { Language, TranslationKey } from '../lib/i18n';
import {
  formatCompactKrw,
  formatFullKrw,
  formatMonthLong,
  formatMonthTick,
  formatPercent,
  formatSignedCompactKrw,
} from '../lib/format';
import {
  createMonthBandPlugin,
  createNegativeZonePlugin,
  createNetBadgePlugin,
  type TrendOverlayState,
} from '../lib/trendChartPlugins';

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface Props {
  points: MonthlyTrendPoint[];
  t: (key: TranslationKey) => string;
  language: Language;
  theme?: 'light' | 'dark';
  onMonthClick?: (month: string) => void;
  /** Rendered on the right side of the section-less card header. */
  headerRight?: React.ReactNode;
  /** Optional in-card title; omit when an enclosing section already labels it. */
  title?: string;
  /** Month currently driving the detail section, highlighted with a band. */
  selectedMonth?: string;
}

const SERIES = {
  income: { hex: '#16a34a', rgb: '22, 163, 74' },
  expense: { hex: '#dc2626', rgb: '220, 38, 38' },
  savings: { hex: '#7c3aed', rgb: '124, 58, 237' },
  fixed: { hex: '#d97706', rgb: '217, 119, 6' },
} as const;

/** Pinning both y axes to the same width keeps the two canvases aligned. */
const Y_AXIS_WIDTH = 68;
const PLOT_PADDING_RIGHT = 12;
/** Room above the tallest bar for the net badge. */
const BADGE_HEADROOM = 30;

/**
 * Diagonal hatch over the base colour so income and expense stay separable
 * without relying on hue alone.
 */
const hatchCache = new Map<string, CanvasPattern | null>();
function hatchPattern(ctx: CanvasRenderingContext2D, rgb: string, alpha: number): CanvasPattern | string {
  const key = `${rgb}-${alpha}`;
  if (!hatchCache.has(key)) {
    const tile = document.createElement('canvas');
    tile.width = 6;
    tile.height = 6;
    const tileCtx = tile.getContext('2d');
    if (!tileCtx) return `rgba(${rgb}, ${alpha})`;
    tileCtx.fillStyle = `rgba(${rgb}, ${alpha})`;
    tileCtx.fillRect(0, 0, 6, 6);
    tileCtx.strokeStyle = `rgba(255, 255, 255, ${0.5 * alpha})`;
    tileCtx.lineWidth = 1.5;
    tileCtx.beginPath();
    tileCtx.moveTo(0, 6);
    tileCtx.lineTo(6, 0);
    tileCtx.moveTo(-3, 3);
    tileCtx.lineTo(3, -3);
    tileCtx.moveTo(3, 9);
    tileCtx.lineTo(9, 3);
    tileCtx.stroke();
    hatchCache.set(key, ctx.createPattern(tile, 'repeat'));
  }
  return hatchCache.get(key) ?? `rgba(${rgb}, ${alpha})`;
}

export function MonthlyTrendChart({
  points,
  t,
  language,
  theme = 'light',
  onMonthClick,
  headerRight,
  title,
  selectedMonth,
}: Props) {
  const barRef = useRef<ChartJS<'bar'>>(null);
  const labels = points.map((p) => p.month);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const inProgressIndex = labels.indexOf(currentMonth);

  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#f3f4f6';
  const zeroLineColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
  const mutedColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
  const tooltipStyle = {
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
  };

  const totals = useMemo(() => {
    const income = points.reduce((sum, p) => sum + p.totalIncome, 0);
    const expense = points.reduce((sum, p) => sum + p.totalExpense, 0);
    return {
      income,
      expense,
      net: income - expense,
      ending: points.length > 0 ? points[points.length - 1].cumulativeSavings : 0,
    };
  }, [points]);

  /**
   * The overlay plugins are created once (see below) because react-chartjs-2
   * never refreshes `config.plugins`. They read this ref, which is refreshed on
   * every render, so switching the range repaints badges and bands from the
   * current data instead of the data present when the chart was mounted.
   */
  const overlayState = useRef<TrendOverlayState>({
    points,
    labels,
    selectedMonth,
    inProgressIndex,
    theme,
    mutedColor,
    noRecordsLabel: t('noRecords'),
    inProgressLabel: t('inProgressMonth'),
  });
  overlayState.current = {
    points,
    labels,
    selectedMonth,
    inProgressIndex,
    theme,
    mutedColor,
    noRecordsLabel: t('noRecords'),
    inProgressLabel: t('inProgressMonth'),
  };

  const selectMonthAt = useCallback(
    (index: number | undefined) => {
      if (index === undefined || !onMonthClick) return;
      const month = labels[index];
      if (month) onMonthClick(month);
    },
    [labels, onMonthClick],
  );

  const handleHover = useCallback(
    (_event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
      chart.canvas.style.cursor = onMonthClick && elements.length > 0 ? 'pointer' : 'default';
    },
    [onMonthClick],
  );

  /** Highlight band for the selected month plus a marker for the in-progress one. */
  const plugins = useRef<Plugin[]>();
  if (!plugins.current) {
    const getState = () => overlayState.current;
    plugins.current = [
      createMonthBandPlugin(getState),
      createNetBadgePlugin(getState),
      createNegativeZonePlugin(getState),
    ];
  }
  const [bandPlugin, netBadgePlugin, negativeZonePlugin] = plugins.current;

  const barData = {
    labels,
    datasets: [
      {
        label: t('income'),
        data: points.map((p) => p.totalIncome),
        backgroundColor: (context: { chart: Chart; dataIndex: number }) =>
          `rgba(${SERIES.income.rgb}, ${context.dataIndex === inProgressIndex ? 0.45 : 0.9})`,
        hoverBackgroundColor: SERIES.income.hex,
        borderRadius: 3,
        borderSkipped: false as const,
        categoryPercentage: 0.7,
        barPercentage: 0.9,
      },
      {
        label: t('expense'),
        data: points.map((p) => p.totalExpense),
        backgroundColor: (context: { chart: Chart; dataIndex: number }) =>
          hatchPattern(context.chart.ctx, SERIES.expense.rgb, context.dataIndex === inProgressIndex ? 0.45 : 0.9),
        hoverBackgroundColor: SERIES.expense.hex,
        borderRadius: 3,
        borderSkipped: false as const,
        categoryPercentage: 0.7,
        barPercentage: 0.9,
      },
    ],
  };

  const stripData = {
    labels,
    datasets: [
      {
        label: t('cumulativeSavings'),
        data: points.map((p) => p.cumulativeSavings),
        borderColor: SERIES.savings.hex,
        backgroundColor: `rgba(${SERIES.savings.rgb}, ${theme === 'dark' ? 0.22 : 0.12})`,
        borderWidth: 2,
        tension: 0,
        fill: 'origin' as const,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: SERIES.savings.hex,
        pointHoverBorderColor: theme === 'dark' ? '#111827' : '#ffffff',
        pointHoverBorderWidth: 2,
      },
      {
        label: t('fixedCost'),
        data: points.map((p) => p.fixedCost),
        borderColor: SERIES.fixed.hex,
        // Dashed so the two lines stay apart without relying on hue alone.
        borderDash: [5, 3],
        borderWidth: 2,
        tension: 0,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: SERIES.fixed.hex,
        pointHoverBorderColor: theme === 'dark' ? '#111827' : '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const header =
    title || headerRight ? (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {title && <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>}
        {headerRight}
      </div>
    ) : null;

  if (points.length === 0) {
    return (
      <Card>
        {header}
        <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">{t('noDataAvailable')}</p>
      </Card>
    );
  }

  return (
    <Card>
      {header}

      {/* 기간 요약: 차트를 읽지 않아도 결론이 보이도록 */}
      <dl className="mb-4 grid grid-cols-2 gap-3 border-b border-gray-100 pb-4 sm:grid-cols-4 dark:border-gray-800">
        {[
          { label: t('totalIncome'), value: formatFullKrw(totals.income), tone: 'text-green-600 dark:text-green-400' },
          { label: t('totalExpense'), value: formatFullKrw(totals.expense), tone: 'text-red-600 dark:text-red-400' },
          {
            label: t('netIncome'),
            value: `${totals.net > 0 ? '+' : ''}${formatFullKrw(totals.net)}`,
            tone: totals.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          },
          { label: t('endingSavings'), value: formatFullKrw(totals.ending), tone: 'text-brand-600 dark:text-brand-400' },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</dt>
            <dd className={`mt-0.5 text-sm font-semibold tabular-nums ${stat.tone}`}>{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* 범례: 색 외에 패턴/선 형태로도 구분 */}
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SERIES.income.hex }} />
          {t('income')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${SERIES.expense.hex} 0 2px, rgba(255,255,255,0.6) 2px 3px)`,
            }}
          />
          {t('expense')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: SERIES.savings.hex }} />
          {t('cumulativeSavings')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0.5 w-4"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${SERIES.fixed.hex} 0 5px, transparent 5px 8px)`,
            }}
          />
          {t('fixedCost')}
        </span>
      </div>

      <div className="h-60 sm:h-[300px]">
        <Bar
          ref={barRef}
          data={barData}
          plugins={[bandPlugin, netBadgePlugin]}
          role="img"
          aria-label={`${t('monthlyTrend')} — ${t('income')}, ${t('expense')}, ${t('netIncome')}`}
          onClick={(event) => {
            const elements = barRef.current?.getElementsAtEventForMode(
              event.nativeEvent,
              'index',
              { intersect: false },
              false,
            );
            selectMonthAt(elements?.[0]?.index);
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            layout: { padding: { top: BADGE_HEADROOM, right: PLOT_PADDING_RIGHT } },
            interaction: { mode: 'index', intersect: false },
            hover: { mode: 'index', intersect: false },
            onHover: handleHover,
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltipStyle,
                callbacks: {
                  title: (items) => (items.length ? formatMonthLong(items[0].label, language) : ''),
                  label: (context) => ` ${context.dataset.label}: ${formatFullKrw(context.parsed.y ?? 0)}`,
                  footer: (items) => {
                    const point = points[items[0]?.dataIndex ?? 0];
                    if (!point) return '';
                    if (!point.hasTransactions) return t('noRecords');
                    const lines = [`${t('netIncome')}: ${formatSignedCompactKrw(point.netAmount)}`];
                    lines.push(
                      `${t('savingsRate')}: ${
                        point.totalIncome > 0 ? formatPercent((point.netAmount / point.totalIncome) * 100) : '—'
                      }`,
                    );
                    const previous = points[(items[0]?.dataIndex ?? 0) - 1];
                    if (previous) {
                      const delta = (current: number, before: number) =>
                        before > 0 ? formatPercent(((current - before) / before) * 100) : '—';
                      lines.push(
                        `${t('momChange')}: ${t('income')} ${delta(point.totalIncome, previous.totalIncome)} · ${t(
                          'expense',
                        )} ${delta(point.totalExpense, previous.totalExpense)}`,
                      );
                    }
                    return lines;
                  },
                },
                footerFont: { weight: 'normal' },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: axisColor,
                  font: { size: 11 },
                  autoSkip: true,
                  maxTicksLimit: 12,
                  maxRotation: 0,
                  callback: (_value, index) => formatMonthTick(labels[index] ?? '', index, language),
                },
              },
              y: {
                beginAtZero: true,
                afterFit: (scale) => {
                  scale.width = Y_AXIS_WIDTH;
                },
                ticks: {
                  color: axisColor,
                  font: { size: 11 },
                  maxTicksLimit: 6,
                  callback: (value) => formatCompactKrw(Number(value)),
                },
                grid: { color: gridColor },
                border: { display: false },
              },
            },
          }}
        />
      </div>

      {/* 누적 저축액: 흐름이 아닌 잔액이므로 x축만 공유하는 별도 스트립 */}
      <div className="mt-1 h-[120px]">
        <Line
          data={stripData}
          plugins={[bandPlugin, negativeZonePlugin]}
          role="img"
          aria-label={t('cumulativeSavings')}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            layout: { padding: { top: 6, right: PLOT_PADDING_RIGHT } },
            interaction: { mode: 'index', intersect: false },
            hover: { mode: 'index', intersect: false },
            onHover: handleHover,
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltipStyle,
                callbacks: {
                  title: (items) => (items.length ? formatMonthLong(items[0].label, language) : ''),
                  label: (context) => ` ${context.dataset.label}: ${formatFullKrw(context.parsed.y ?? 0)}`,
                  footer: (items) => {
                    const index = items[0]?.dataIndex ?? 0;
                    const previous = points[index - 1];
                    if (!previous) return '';
                    return `${t('momChange')}: ${formatSignedCompactKrw(
                      points[index].cumulativeSavings - previous.cumulativeSavings,
                    )}`;
                  },
                },
                footerFont: { weight: 'normal' },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { display: false },
                border: { display: false },
              },
              y: {
                afterFit: (scale) => {
                  scale.width = Y_AXIS_WIDTH;
                },
                // Shared by both strip series, so the ticks stay neutral rather
                // than taking either line's colour.
                ticks: {
                  color: axisColor,
                  font: { size: 10 },
                  maxTicksLimit: 3,
                  callback: (value) => formatCompactKrw(Number(value)),
                },
                grid: {
                  color: (context) => (context.tick?.value === 0 ? zeroLineColor : 'transparent'),
                },
                border: { display: false },
              },
            },
          }}
        />
      </div>

      {/* 스크린 리더용 대체 표 */}
      <table className="sr-only">
        <caption>{t('trendChartSummary')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('date')}</th>
            <th scope="col">{t('income')}</th>
            <th scope="col">{t('expense')}</th>
            <th scope="col">{t('netIncome')}</th>
            <th scope="col">{t('fixedCost')}</th>
            <th scope="col">{t('cumulativeSavings')}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.month}>
              <th scope="row">{formatMonthLong(point.month, language)}</th>
              <td>{formatFullKrw(point.totalIncome)}</td>
              <td>{formatFullKrw(point.totalExpense)}</td>
              <td>{formatFullKrw(point.netAmount)}</td>
              <td>{formatFullKrw(point.fixedCost)}</td>
              <td>{formatFullKrw(point.cumulativeSavings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
