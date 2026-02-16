import { apiClient } from './client';
import { Tag, CreateTagRequest } from '@/types';

export const tagAPI = {
  getAll: () => apiClient.get<Tag[]>('/api/tags'),
  
  create: (data: CreateTagRequest) => apiClient.post<Tag>('/api/tags', data),
  
  update: (id: number, data: CreateTagRequest) => 
    apiClient.put<Tag>(`/api/tags/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/api/tags/${id}`),
};
