import { apiClient } from './client';
import { Transaction, CreateTransactionRequest, PageResponse } from '@/types';

interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  type?: 'INCOME' | 'EXPENSE';
}

export const transactionAPI = {
  getAll: (params?: TransactionQueryParams) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.type) query.append('type', params.type);
    
    return apiClient.get<Transaction[]>(
      `/api/transactions?${query.toString()}`
    );
  },
  
  getById: (id: number) => {
    return apiClient.get<Transaction>(`/api/transactions/${id}`);
  },
  
  create: (data: CreateTransactionRequest) => {
    return apiClient.post<Transaction>('/api/transactions', data);
  },
  
  update: (id: number, data: CreateTransactionRequest) => {
    return apiClient.put<Transaction>(`/api/transactions/${id}`, data);
  },
  
  delete: (id: number) => {
    return apiClient.delete<void>(`/api/transactions/${id}`);
  },
};
