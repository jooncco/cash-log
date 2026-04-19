import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { categoryApi } from '../api/categories';
import type { Category, CreateCategoryRequest } from '../../types';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (data: CreateCategoryRequest) => Promise<void>;
  updateCategory: (id: number, data: CreateCategoryRequest) => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>()(
  devtools((set, get) => ({
    categories: [],
    loading: false,

    fetchCategories: async () => {
      set({ loading: true });
      try {
        const data = await categoryApi.getAll();
        set({ categories: data, loading: false });
      } catch {
        set({ loading: false });
      }
    },

    addCategory: async (data) => {
      await categoryApi.create(data);
      await get().fetchCategories();
    },

    updateCategory: async (id, data) => {
      await categoryApi.update(id, data);
      await get().fetchCategories();
    },

    removeCategory: async (id) => {
      await categoryApi.delete(id);
      await get().fetchCategories();
    },
  })),
);
