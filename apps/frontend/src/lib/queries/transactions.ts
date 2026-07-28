import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../api/transactions';
import { reportMutationError } from './mutationError';
import type { CreateTransactionRequest, Transaction, TransactionFilterParams } from '../../types';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilterParams) => [...transactionKeys.all, filters] as const,
};

export function useTransactions(filters: TransactionFilterParams = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionApi.getAll(filters),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
    onError: reportMutationError,
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTransactionRequest }) =>
      transactionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
    onError: reportMutationError,
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionApi.delete(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.all });
      const previousLists = queryClient.getQueriesData<Transaction[]>({ queryKey: transactionKeys.all });
      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData<Transaction[]>(queryKey, data.filter((tx) => tx.id !== id));
      });
      return { previousLists };
    },
    onError: (error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      reportMutationError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
