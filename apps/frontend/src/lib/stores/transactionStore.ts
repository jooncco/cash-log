import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { transactionApi } from '../api/transactions';
import type { Transaction, CreateTransactionRequest, TransactionFilterParams } from '../../types';

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilterParams;
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: CreateTransactionRequest) => Promise<void>;
  updateTransaction: (id: number, data: CreateTransactionRequest) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilterParams>) => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  devtools((set, get) => ({
    transactions: [],
    filters: {},
    loading: false,
    error: null,

    fetchTransactions: async () => {
      set({ loading: true, error: null });
      try {
        const data = await transactionApi.getAll(get().filters);
        set({ transactions: data, loading: false });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      }
    },

    addTransaction: async (data) => {
      await transactionApi.create(data);
      await get().fetchTransactions();
    },

    updateTransaction: async (id, data) => {
      await transactionApi.update(id, data);
      await get().fetchTransactions();
    },

    deleteTransaction: async (id) => {
      const prev = get().transactions;
      set({ transactions: prev.filter((t) => t.id !== id) });
      try {
        await transactionApi.delete(id);
      } catch {
        set({ transactions: prev });
      }
    },

    setFilters: (filters) => {
      set({ filters: { ...get().filters, ...filters } });
      get().fetchTransactions();
    },

    clearError: () => set({ error: null }),
  })),
);
