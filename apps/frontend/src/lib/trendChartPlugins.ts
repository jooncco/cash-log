import type { Chart, Plugin, Scale } from 'chart.js';
import type { MonthlyTrendPoint } from '../types';
import { formatSignedCompactKrw } from './format';

/**
 * Everything the overlay plugins need to paint one frame.
 *
 * `react-chartjs-2` only passes `plugins` to the Chart constructor and never
 * refreshes `config.plugins` afterwards, so a plugin that closes over props
 * keeps drawing the values it saw at mount time. The plugins below therefore
 * take a getter and read the current state on every draw.
 */
export interface TrendOverlayState {
  points: MonthlyTrendPoint[];
  /** `yyyy-MM` labels, in the same order as `points`. */
  labels: string[];
  /** Month driving the detail section, highlighted with a band. */
  selectedMonth?: string;
  /** Index of the month that is still running, or -1. */
  inProgressIndex: number;
  theme: 'light' | 'dark';
  /** Colour for de-emphasised text ("no records", "in progress"). */
  mutedColor: string;
  noRecordsLabel: string;
  inProgressLabel: string;
}

export type TrendOverlayStateGetter = () => TrendOverlayState;

const SERIES = {
  income: { hex: '#16a34a', rgb: '22, 163, 74' },
  expense: { hex: '#dc2626', rgb: '220, 38, 38' },
} as const;

const BADGE_HEIGHT = 18;

function categoryBandWidth(scale: Scale, count: number): number {
  if (count > 1) return Math.abs(scale.getPixelForValue(1) - scale.getPixelForValue(0));
  return scale.width;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Highlight band for the selected month plus a marker for the in-progress one. */
export function createMonthBandPlugin(getState: TrendOverlayStateGetter): Plugin {
  return {
    id: 'monthBands',
    beforeDatasetsDraw(chart: Chart) {
      const { labels, selectedMonth, inProgressIndex, theme } = getState();
      const { ctx, chartArea, scales } = chart;
      const x = scales.x;
      if (!x || labels.length === 0) return;
      const bandWidth = categoryBandWidth(x, labels.length);

      const drawBand = (index: number, fill: string) => {
        if (index < 0 || index >= labels.length) return;
        const center = x.getPixelForValue(index);
        ctx.save();
        ctx.fillStyle = fill;
        ctx.fillRect(center - bandWidth / 2, chartArea.top, bandWidth, chartArea.bottom - chartArea.top);
        ctx.restore();
      };

      drawBand(inProgressIndex, theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.06)');
      drawBand(
        selectedMonth ? labels.indexOf(selectedMonth) : -1,
        theme === 'dark' ? 'rgba(40, 81, 224, 0.18)' : 'rgba(40, 81, 224, 0.08)',
      );
    },
  };
}

/** Net amount rendered as a badge above each month's bars. */
export function createNetBadgePlugin(getState: TrendOverlayStateGetter): Plugin {
  return {
    id: 'netBadges',
    afterDatasetsDraw(chart: Chart) {
      const { points, inProgressIndex, theme, mutedColor, noRecordsLabel, inProgressLabel } = getState();
      const { ctx, chartArea, scales } = chart;
      const x = scales.x;
      const y = scales.y;
      if (!x || !y) return;

      ctx.save();
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      points.forEach((point, index) => {
        const center = x.getPixelForValue(index);
        const tallest = Math.max(point.totalIncome, point.totalExpense);
        const barTop = y.getPixelForValue(tallest);

        if (!point.hasTransactions) {
          ctx.fillStyle = mutedColor;
          ctx.fillText(noRecordsLabel, center, Math.max(chartArea.top + 10, barTop - 12));
          return;
        }

        const text = formatSignedCompactKrw(point.netAmount);
        const isPositive = point.netAmount >= 0;
        const rgb = isPositive ? SERIES.income.rgb : SERIES.expense.rgb;
        const width = ctx.measureText(text).width + 14;
        const centerY = Math.max(chartArea.top + BADGE_HEIGHT / 2, barTop - 14);

        roundedRect(ctx, center - width / 2, centerY - BADGE_HEIGHT / 2, width, BADGE_HEIGHT, 9);
        ctx.fillStyle = `rgba(${rgb}, ${theme === 'dark' ? 0.22 : 0.12})`;
        ctx.fill();
        ctx.fillStyle = isPositive ? SERIES.income.hex : SERIES.expense.hex;
        ctx.fillText(text, center, centerY);
      });

      if (inProgressIndex >= 0 && inProgressIndex < points.length) {
        ctx.font = '500 10px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = mutedColor;
        ctx.fillText(inProgressLabel, x.getPixelForValue(inProgressIndex), chartArea.top - 12);
      }
      ctx.restore();
    },
  };
}

/** Shade the area below zero so a negative savings balance reads instantly. */
export function createNegativeZonePlugin(getState: TrendOverlayStateGetter): Plugin {
  return {
    id: 'negativeZone',
    beforeDatasetsDraw(chart: Chart) {
      const { theme } = getState();
      const { ctx, chartArea, scales } = chart;
      const y = scales.y;
      if (!y || y.min >= 0) return;
      const zero = y.getPixelForValue(0);
      if (zero >= chartArea.bottom) return;
      ctx.save();
      ctx.fillStyle = theme === 'dark' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 38, 38, 0.06)';
      ctx.fillRect(chartArea.left, zero, chartArea.right - chartArea.left, chartArea.bottom - zero);
      ctx.restore();
    },
  };
}
