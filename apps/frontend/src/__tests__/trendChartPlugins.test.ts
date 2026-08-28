import type { Chart } from 'chart.js';
import {
  createMonthBandPlugin,
  createNetBadgePlugin,
  type TrendOverlayState,
} from '../lib/trendChartPlugins';
import type { MonthlyTrendPoint } from '../types';

function point(month: string, income: number, expense: number, hasTransactions = true): MonthlyTrendPoint {
  return {
    month,
    totalIncome: income,
    totalExpense: expense,
    netAmount: income - expense,
    fixedCost: 0,
    cumulativeSavings: income - expense,
    hasTransactions,
  };
}

/** Canvas double that records what each plugin painted and where. */
function fakeChart(categoryCount: number) {
  const texts: { text: string; x: number; y: number }[] = [];
  const rects: { x: number; width: number }[] = [];
  const ctx = {
    save: jest.fn(),
    restore: jest.fn(),
    fill: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    arcTo: jest.fn(),
    measureText: (text: string) => ({ width: text.length * 6 }),
    fillText: (text: string, x: number, y: number) => texts.push({ text, x, y }),
    fillRect: (x: number, _y: number, width: number) => rects.push({ x, width }),
    font: '',
    fillStyle: '',
    textAlign: '',
    textBaseline: '',
  };
  // 100px per category, plot area starting at x = 0.
  const chart = {
    ctx,
    chartArea: { top: 30, bottom: 300, left: 0, right: categoryCount * 100 },
    scales: {
      x: { getPixelForValue: (i: number) => i * 100 + 50, width: categoryCount * 100 },
      y: { getPixelForValue: () => 200, min: 0 },
    },
  } as unknown as Chart;
  return { chart, texts, rects };
}

const baseState = {
  selectedMonth: undefined,
  inProgressIndex: -1,
  theme: 'light' as const,
  mutedColor: '#9ca3af',
  noRecordsLabel: '거래 없음',
  inProgressLabel: '진행 중',
};

function stateFor(points: MonthlyTrendPoint[], overrides: Partial<TrendOverlayState> = {}): TrendOverlayState {
  return {
    ...baseState,
    points,
    labels: points.map((p) => p.month),
    ...overrides,
  };
}

const eightMonths = [
  point('2026-01', 6_000_000, 9_000_000),
  point('2026-02', 13_000_000, 6_000_000),
  point('2026-03', 10_000_000, 9_000_000),
  point('2026-04', 5_000_000, 5_500_000),
  point('2026-05', 6_000_000, 6_400_000),
  point('2026-06', 8_900_000, 6_400_000),
  point('2026-07', 6_300_000, 5_900_000),
  point('2026-08', 0, 1_300_000),
];

const lastThree = eightMonths.slice(-3);

describe('createNetBadgePlugin', () => {
  it('draws one badge per point, centred on its category', () => {
    const state = stateFor(lastThree);
    const plugin = createNetBadgePlugin(() => state);
    const { chart, texts } = fakeChart(lastThree.length);

    plugin.afterDatasetsDraw?.(chart, { cancelable: false }, {});

    expect(texts.map((t) => t.text)).toEqual(['+250만', '+40만', '-130만']);
    expect(texts.map((t) => t.x)).toEqual([50, 150, 250]);
  });

  it('repaints from the current range after it changes without a remount', () => {
    // Regression: react-chartjs-2 keeps the plugins handed to the Chart
    // constructor, so a plugin that captured `points` kept drawing the badges of
    // the range that was active at mount time, leaving them misaligned when the
    // user toggled between range presets.
    let state = stateFor(eightMonths);
    const plugin = createNetBadgePlugin(() => state);

    const mounted = fakeChart(eightMonths.length);
    plugin.afterDatasetsDraw?.(mounted.chart, { cancelable: false }, {});
    expect(mounted.texts).toHaveLength(8);

    state = stateFor(lastThree);
    const switched = fakeChart(lastThree.length);
    plugin.afterDatasetsDraw?.(switched.chart, { cancelable: false }, {});

    expect(switched.texts.map((t) => t.text)).toEqual(['+250만', '+40만', '-130만']);
    expect(switched.texts.every((t) => t.x <= switched.chart.chartArea.right)).toBe(true);
  });

  it('labels months without any transaction instead of showing a zero badge', () => {
    const state = stateFor([point('2026-02', 0, 0, false)]);
    const plugin = createNetBadgePlugin(() => state);
    const { chart, texts } = fakeChart(1);

    plugin.afterDatasetsDraw?.(chart, { cancelable: false }, {});

    expect(texts).toEqual([{ text: '거래 없음', x: 50, y: 188 }]);
  });

  it('marks the in-progress month only while it is inside the range', () => {
    let state = stateFor(lastThree, { inProgressIndex: 2 });
    const plugin = createNetBadgePlugin(() => state);
    const inRange = fakeChart(lastThree.length);
    plugin.afterDatasetsDraw?.(inRange.chart, { cancelable: false }, {});
    expect(inRange.texts.map((t) => t.text)).toContain('진행 중');

    state = stateFor(lastThree, { inProgressIndex: 7 });
    const outOfRange = fakeChart(lastThree.length);
    plugin.afterDatasetsDraw?.(outOfRange.chart, { cancelable: false }, {});
    expect(outOfRange.texts.map((t) => t.text)).not.toContain('진행 중');
  });
});

describe('createMonthBandPlugin', () => {
  it('moves the selected-month band when the range changes', () => {
    let state = stateFor(eightMonths, { selectedMonth: '2026-07' });
    const plugin = createMonthBandPlugin(() => state);

    const mounted = fakeChart(eightMonths.length);
    plugin.beforeDatasetsDraw?.(mounted.chart, { cancelable: false }, {});
    // 2026-07 is index 6 of eight: centre 650, band width 100.
    expect(mounted.rects).toEqual([{ x: 600, width: 100 }]);

    state = stateFor(lastThree, { selectedMonth: '2026-07' });
    const switched = fakeChart(lastThree.length);
    plugin.beforeDatasetsDraw?.(switched.chart, { cancelable: false }, {});
    // 2026-07 is index 1 of three: centre 150.
    expect(switched.rects).toEqual([{ x: 100, width: 100 }]);
  });

  it('skips bands for months outside the current range', () => {
    const state = stateFor(lastThree, { selectedMonth: '2026-01', inProgressIndex: 9 });
    const plugin = createMonthBandPlugin(() => state);
    const { chart, rects } = fakeChart(lastThree.length);

    plugin.beforeDatasetsDraw?.(chart, { cancelable: false }, {});

    expect(rects).toEqual([]);
  });
});
