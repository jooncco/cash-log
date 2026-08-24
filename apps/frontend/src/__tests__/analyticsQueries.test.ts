import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { analyticsApi } from '../lib/api/analytics';
import { apiClient } from '../lib/api/client';
import { analyticsKeys, useMonthlyTrend } from '../lib/queries/analytics';
import type { MonthlyTrendPoint } from '../types';

jest.mock('../lib/api/client');
const mockedClient = jest.mocked(apiClient);

const points: MonthlyTrendPoint[] = [
  {
    month: '2024-01',
    totalIncome: 100000,
    totalExpense: 40000,
    netAmount: 60000,
    fixedCost: 15000,
    cumulativeSavings: 60000,
    hasTransactions: true,
  },
  {
    month: '2024-02',
    totalIncome: 0,
    totalExpense: 25000,
    netAmount: -25000,
    fixedCost: 15000,
    cumulativeSavings: 35000,
    hasTransactions: true,
  },
];

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => jest.clearAllMocks());

describe('analyticsApi.getMonthlyTrend', () => {
  it('omits the query string entirely when no bounds are given (full history)', async () => {
    mockedClient.get.mockResolvedValue(points);

    await analyticsApi.getMonthlyTrend();

    expect(mockedClient.get).toHaveBeenCalledWith('/api/analytics/monthly-trend');
  });

  it('sends only the bounds that are set', async () => {
    mockedClient.get.mockResolvedValue(points);

    await analyticsApi.getMonthlyTrend({ startDate: '2024-01-01' });
    expect(mockedClient.get).toHaveBeenCalledWith('/api/analytics/monthly-trend?startDate=2024-01-01');

    await analyticsApi.getMonthlyTrend({ startDate: '2024-01-01', endDate: '2024-03-31' });
    expect(mockedClient.get).toHaveBeenCalledWith(
      '/api/analytics/monthly-trend?startDate=2024-01-01&endDate=2024-03-31',
    );
  });
});

describe('analyticsKeys.monthlyTrend', () => {
  it('keeps an empty range distinct from a bounded one', () => {
    expect(analyticsKeys.monthlyTrend({})).not.toEqual(
      analyticsKeys.monthlyTrend({ startDate: '2024-01-01', endDate: '2024-03-31' }),
    );
  });
});

describe('useMonthlyTrend', () => {
  it('returns the trend points including negative net months and running savings', async () => {
    mockedClient.get.mockResolvedValue(points);

    const { result } = renderHook(() => useMonthlyTrend(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(points);
    expect(result.current.data?.[1].netAmount).toBe(-25000);
    expect(result.current.data?.[1].cumulativeSavings).toBe(35000);
  });
});
