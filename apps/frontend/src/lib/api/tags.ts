import { apiClient } from './client';
import type { Tag, CreateTagRequest } from '../../types';

export const tagApi = {
  getAll: () => apiClient.get<Tag[]>('/api/tags'),
  create: (data: CreateTagRequest) => apiClient.post<Tag>('/api/tags', data),
  delete: (id: number) => apiClient.delete<void>(`/api/tags/${id}`),
};
