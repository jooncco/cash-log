import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Budget, CreateBudgetRequest } from '@/types';
import { budgetAPI } from '../api/budgets';

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  
  fetchBudgets: () => Promise<void>;
  addBudget: (data: CreateBudgetRequest) => Promise<void>;
  updateBudget: (id: number, data: CreateBudgetRequest) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  devtools(
    (set, get) => ({
      budgets: [],
      loading: false,
      error: null,
      
      fetchBudgets: async () => {
        set({ loading: true, error: null });
        try {
          const budgets = await budgetAPI.getAll();
          set({ budgets, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      addBudget: async (data) => {
        set({ loading: true, error: null });
        try {
          await budgetAPI.create(data);
          await get().fetchBudgets();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      updateBudget: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await budgetAPI.update(id, data);
          await get().fetchBudgets();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      deleteBudget: async (id) => {
        const { budgets } = get();
        set({ budgets: budgets.filter(b => b.id !== id) });
        try {
          await budgetAPI.delete(id);
        } catch (error: any) {
          set({ budgets, error: error.message });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    { name: 'BudgetStore' }
  )
);
