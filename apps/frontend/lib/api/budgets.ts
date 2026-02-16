import { apiClient } from './client';
import { Budget, CreateBudgetRequest } from '@/types';

export const budgetAPI = {
  getAll: () => apiClient.get<Budget[]>('/api/budgets'),
  
  getById: (id: number) => apiClient.get<Budget>(`/api/budgets/${id}`),
  
  create: (data: CreateBudgetRequest) => apiClient.post<Budget>('/api/budgets', data),
  
  update: (id: number, data: CreateBudgetRequest) => 
    apiClient.put<Budget>(`/api/budgets/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/api/budgets/${id}`),
};
