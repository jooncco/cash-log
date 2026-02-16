import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Tag, CreateTagRequest } from '@/types';
import { tagAPI } from '../api/tags';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  
  fetchTags: () => Promise<void>;
  addTag: (data: CreateTagRequest) => Promise<void>;
  updateTag: (id: number, data: CreateTagRequest) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useTagStore = create<TagState>()(
  devtools(
    (set, get) => ({
      tags: [],
      loading: false,
      error: null,
      
      fetchTags: async () => {
        set({ loading: true, error: null });
        try {
          const tags = await tagAPI.getAll();
          set({ tags, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      addTag: async (data) => {
        set({ loading: true, error: null });
        try {
          await tagAPI.create(data);
          await get().fetchTags();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      updateTag: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await tagAPI.update(id, data);
          await get().fetchTags();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      deleteTag: async (id) => {
        const { tags } = get();
        set({ tags: tags.filter(t => t.id !== id) });
        try {
          await tagAPI.delete(id);
        } catch (error: any) {
          set({ tags, error: error.message });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    { name: 'TagStore' }
  )
);
