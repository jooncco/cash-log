import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  monthlySummary: (year: number, month: number) =>
    [...analyticsKeys.all, 'monthly-summary', year, month] as const,
  categoryBreakdown: (year: number, month: number, type: 'INCOME' | 'EXPENSE') =>
    [...analyticsKeys.all, 'category-breakdown', year, month, type] as const,
  tagBreakdown: (year: number, month: number, type: 'INCOME' | 'EXPENSE') =>
    [...analyticsKeys.all, 'tag-breakdown', year, month, type] as const,
};

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: analyticsKeys.monthlySummary(year, month),
    queryFn: () => analyticsApi.getMonthlySummary(year, month),
  });
}

export function useCategoryBreakdown(year: number, month: number, type: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: analyticsKeys.categoryBreakdown(year, month, type),
    queryFn: () => analyticsApi.getCategoryBreakdown(year, month, type),
  });
}

export function useTagBreakdown(year: number, month: number, type: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: analyticsKeys.tagBreakdown(year, month, type),
    queryFn: () => analyticsApi.getTagBreakdown(year, month, type),
  });
}
