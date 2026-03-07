import { apiClient } from './client';
import { Category, CreateCategoryRequest } from '@/types';

export const categoryAPI = {
  getAll: () => {
    return apiClient.get<Category[]>('/api/categories');
  },
  
  getById: (id: number) => {
    return apiClient.get<Category>(`/api/categories/${id}`);
  },
  
  create: (data: CreateCategoryRequest) => {
    return apiClient.post<Category>('/api/categories', data);
  },
  
  update: (id: number, data: CreateCategoryRequest) => {
    return apiClient.put<Category>(`/api/categories/${id}`, data);
  },
  
  delete: (id: number) => {
    return apiClient.delete(`/api/categories/${id}`);
  },
};
