import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Transaction, CreateTransactionRequest, PageResponse } from '@/types';
import { transactionAPI } from '../api/transactions';

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'INCOME' | 'EXPENSE';
  search?: string;
}

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: CreateTransactionRequest) => Promise<void>;
  updateTransaction: (id: number, data: CreateTransactionRequest) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    (set, get) => ({
      transactions: [],
      filters: {},
      loading: false,
      error: null,
      
      fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const response = await transactionAPI.getAll(filters);
          set({
            transactions: Array.isArray(response) ? response : [],
            loading: false,
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      addTransaction: async (data) => {
        set({ loading: true, error: null });
        try {
          await transactionAPI.create(data);
          await get().fetchTransactions();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      updateTransaction: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await transactionAPI.update(id, data);
          await get().fetchTransactions();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      deleteTransaction: async (id) => {
        const { transactions } = get();
        set({ transactions: transactions.filter(t => t.id !== id) });
        try {
          await transactionAPI.delete(id);
        } catch (error: any) {
          set({ transactions, error: error.message });
          throw error;
        }
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
        get().fetchTransactions();
      },
      
      clearError: () => set({ error: null }),
    }),
    { name: 'TransactionStore' }
  )
);
