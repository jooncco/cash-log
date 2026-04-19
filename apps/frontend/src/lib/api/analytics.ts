import { apiClient } from './client';
import type { MonthlySummary, CategoryData } from '../../types';

export const analyticsApi = {
  getMonthlySummary: (yearMonth: string) =>
    apiClient.get<MonthlySummary>(`/api/analytics/monthly-summary?yearMonth=${yearMonth}`),
  getCategoryBreakdown: (startDate: string, endDate: string) =>
    apiClient.get<CategoryData[]>(
      `/api/analytics/category-breakdown?startDate=${startDate}&endDate=${endDate}`,
    ),
};
