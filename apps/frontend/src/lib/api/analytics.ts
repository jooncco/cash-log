import { apiClient } from './client';
import type { BreakdownItem, DateRange, MonthlySummary, MonthlyTrendPoint } from '../../types';

export const analyticsApi = {
  getMonthlySummary: (year: number, month: number) =>
    apiClient.get<MonthlySummary>(`/api/analytics/monthly-summary?year=${year}&month=${month}`),
  /** Omitting both bounds returns the full recorded history. */
  getMonthlyTrend: ({ startDate, endDate }: DateRange = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString();
    return apiClient.get<MonthlyTrendPoint[]>(
      `/api/analytics/monthly-trend${query ? `?${query}` : ''}`,
    );
  },
  getCategoryBreakdown: (year: number, month: number, type: 'INCOME' | 'EXPENSE') =>
    apiClient.get<BreakdownItem[]>(
      `/api/analytics/category-breakdown?year=${year}&month=${month}&type=${type}`,
    ),
  getTagBreakdown: (year: number, month: number, type: 'INCOME' | 'EXPENSE') =>
    apiClient.get<BreakdownItem[]>(
      `/api/analytics/tag-breakdown?year=${year}&month=${month}&type=${type}`,
    ),
};
