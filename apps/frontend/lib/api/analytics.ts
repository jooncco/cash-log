import { apiClient } from './client';
import { MonthlySummary, CategoryData } from '@/types';

export const analyticsAPI = {
  getMonthlySummary: (yearMonth: string) => 
    apiClient.get<MonthlySummary>(`/api/analytics/monthly-summary?yearMonth=${yearMonth}`),
  
  getCategoryBreakdown: (startDate: string, endDate: string) => 
    apiClient.get<CategoryData[]>(
      `/api/analytics/category-breakdown?startDate=${startDate}&endDate=${endDate}`
    ),
};
