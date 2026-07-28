import { apiClient } from './client';
import type { BreakdownItem, MonthlySummary } from '../../types';

export const analyticsApi = {
  getMonthlySummary: (year: number, month: number) =>
    apiClient.get<MonthlySummary>(`/api/analytics/monthly-summary?year=${year}&month=${month}`),
  getCategoryBreakdown: (year: number, month: number, type: 'INCOME' | 'EXPENSE') =>
    apiClient.get<BreakdownItem[]>(
      `/api/analytics/category-breakdown?year=${year}&month=${month}&type=${type}`,
    ),
  getTagBreakdown: (year: number, month: number, type: 'INCOME' | 'EXPENSE') =>
    apiClient.get<BreakdownItem[]>(
      `/api/analytics/tag-breakdown?year=${year}&month=${month}&type=${type}`,
    ),
};
