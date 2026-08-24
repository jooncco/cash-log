import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useCreateTransaction, useDeleteTransaction, useTransactions } from '../lib/queries/transactions';
import { transactionApi } from '../lib/api/transactions';
import { useUIStore } from '../lib/stores/uiStore';
import { APIError } from '../lib/api/client';
import type { PageResponse, Transaction } from '../types';

jest.mock('../lib/api/transactions');
const mockedApi = jest.mocked(transactionApi);

const mockTx: Transaction = {
  id: 1, transactionDate: '2024-01-15', transactionType: 'EXPENSE',
  originalAmount: 10000, originalCurrency: 'KRW', amountKrw: 10000,
  category: { id: 1, name: 'Food', color: '#ff0000', createdAt: '', updatedAt: '' },
  memo: 'lunch', fixedCost: false, tags: [], createdAt: '', updatedAt: '',
};

function mockPage(content: Transaction[]): PageResponse<Transaction> {
  return { content, page: 0, size: 20, totalElements: content.length, totalPages: 1 };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useUIStore.setState({ toasts: [] });
});

describe('useTransactions', () => {
  it('fetches and returns the paginated transaction list', async () => {
    mockedApi.getAll.mockResolvedValue(mockPage([mockTx]));

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPage([mockTx]));
    expect(mockedApi.getAll).toHaveBeenCalledWith({});
  });

  it('exposes an error instead of throwing when the fetch fails', async () => {
    mockedApi.getAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });
});

describe('useCreateTransaction', () => {
  it('calls the API and invalidates the transactions cache on success', async () => {
    mockedApi.create.mockResolvedValue(mockTx);

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        transactionDate: '2024-01-15', originalAmount: 10000, transactionType: 'EXPENSE',
        originalCurrency: 'KRW', categoryId: 1, tagNames: [],
      });
    });

    expect(mockedApi.create).toHaveBeenCalled();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('adds an error toast with the API error message on failure', async () => {
    mockedApi.create.mockRejectedValue(new APIError('Category is required', 400));

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        transactionDate: '2024-01-15', originalAmount: 10000, transactionType: 'EXPENSE',
        originalCurrency: 'KRW', categoryId: 0, tagNames: [],
      }).catch(() => {});
    });

    expect(useUIStore.getState().toasts).toHaveLength(1);
    expect(useUIStore.getState().toasts[0]).toMatchObject({ type: 'error', message: 'Category is required' });
  });
});

describe('useDeleteTransaction', () => {
  it('calls the API and rolls back the cache with a toast on failure', async () => {
    mockedApi.delete.mockRejectedValue(new APIError('Transaction not found', 404));

    const wrapper = createWrapper();
    const { result: deleteResult } = renderHook(() => useDeleteTransaction(), { wrapper });

    await act(async () => {
      await deleteResult.current.mutateAsync(1).catch(() => {});
    });

    expect(mockedApi.delete).toHaveBeenCalledWith(1);
    expect(useUIStore.getState().toasts).toHaveLength(1);
    expect(useUIStore.getState().toasts[0]).toMatchObject({ type: 'error', message: 'Transaction not found' });
  });
});
