import { apiClient } from './client';
import type { Category, CreateCategoryRequest } from '../../types';

export const categoryApi = {
  getAll: () => apiClient.get<Category[]>('/api/categories'),
  create: (data: CreateCategoryRequest) => apiClient.post<Category>('/api/categories', data),
  update: (id: number, data: CreateCategoryRequest) =>
    apiClient.put<Category>(`/api/categories/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/api/categories/${id}`),
};
