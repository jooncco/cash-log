import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Category, CreateCategoryRequest } from '@/types';
import { categoryAPI } from '../api/categories';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  addCategory: (data: CreateCategoryRequest) => Promise<Category | null>;
  updateCategory: (id: number, data: CreateCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,
      
      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const response = await categoryAPI.getAll();
          set({
            categories: Array.isArray(response) ? response : [],
            loading: false,
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      addCategory: async (data) => {
        set({ loading: true, error: null });
        try {
          const newCategory = await categoryAPI.create(data);
          await get().fetchCategories();
          set({ loading: false });
          return newCategory;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await categoryAPI.update(id, data);
          await get().fetchCategories();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      deleteCategory: async (id) => {
        const { categories } = get();
        set({ categories: categories.filter(c => c.id !== id) });
        try {
          await categoryAPI.delete(id);
        } catch (error: any) {
          set({ categories, error: error.message });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    { name: 'CategoryStore' }
  )
);
