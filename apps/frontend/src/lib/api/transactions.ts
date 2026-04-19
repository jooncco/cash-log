import { apiClient } from './client';
import type { Transaction, CreateTransactionRequest, TransactionFilterParams } from '../../types';

function buildQuery(params?: TransactionFilterParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.startDate) q.set('startDate', params.startDate);
  if (params.endDate) q.set('endDate', params.endDate);
  if (params.type) q.set('type', params.type);
  if (params.categoryIds?.length) params.categoryIds.forEach((id) => q.append('categoryId', String(id)));
  if (params.tagIds?.length) params.tagIds.forEach((id) => q.append('tagId', String(id)));
  if (params.page !== undefined) q.set('page', String(params.page));
  if (params.size !== undefined) q.set('size', String(params.size));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const transactionApi = {
  getAll: (params?: TransactionFilterParams) =>
    apiClient.get<Transaction[]>(`/api/transactions${buildQuery(params)}`),
  getById: (id: number) => apiClient.get<Transaction>(`/api/transactions/${id}`),
  create: (data: CreateTransactionRequest) => apiClient.post<Transaction>('/api/transactions', data),
  update: (id: number, data: CreateTransactionRequest) =>
    apiClient.put<Transaction>(`/api/transactions/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/api/transactions/${id}`),
};
