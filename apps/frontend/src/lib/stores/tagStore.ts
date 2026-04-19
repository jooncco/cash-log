import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { tagApi } from '../api/tags';
import type { Tag, CreateTagRequest } from '../../types';

interface TagState {
  tags: Tag[];
  loading: boolean;
  fetchTags: () => Promise<void>;
  addTag: (data: CreateTagRequest) => Promise<void>;
  removeTag: (id: number) => Promise<void>;
}

export const useTagStore = create<TagState>()(
  devtools((set, get) => ({
    tags: [],
    loading: false,

    fetchTags: async () => {
      set({ loading: true });
      try {
        const data = await tagApi.getAll();
        set({ tags: data, loading: false });
      } catch {
        set({ loading: false });
      }
    },

    addTag: async (data) => {
      await tagApi.create(data);
      await get().fetchTags();
    },

    removeTag: async (id) => {
      await tagApi.delete(id);
      await get().fetchTags();
    },
  })),
);
