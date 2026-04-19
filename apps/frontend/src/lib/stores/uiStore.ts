import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Transaction, Tag, Category, Toast } from '../../types';

interface UIState {
  transactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  categoryModalOpen: boolean;
  editingCategory: Category | null;
  tagModalOpen: boolean;
  editingTag: Tag | null;
  exportDialogOpen: boolean;
  exportInitialStartDate: string;
  exportInitialEndDate: string;
  confirmDialogOpen: boolean;
  confirmMessage: string;
  confirmAction: (() => void) | null;
  toasts: Toast[];

  openTransactionModal: (tx?: Transaction) => void;
  closeTransactionModal: () => void;
  openCategoryModal: (cat?: Category) => void;
  closeCategoryModal: () => void;
  openTagModal: (tag?: Tag) => void;
  closeTagModal: () => void;
  openExportDialog: (startDate?: string, endDate?: string) => void;
  closeExportDialog: () => void;
  openConfirmDialog: (message: string, action: () => void) => void;
  closeConfirmDialog: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    transactionModalOpen: false,
    editingTransaction: null,
    categoryModalOpen: false,
    editingCategory: null,
    tagModalOpen: false,
    editingTag: null,
    exportDialogOpen: false,
    exportInitialStartDate: '',
    exportInitialEndDate: '',
    confirmDialogOpen: false,
    confirmMessage: '',
    confirmAction: null,
    toasts: [],

    openTransactionModal: (tx) =>
      set({ transactionModalOpen: true, editingTransaction: tx ?? null }),
    closeTransactionModal: () =>
      set({ transactionModalOpen: false, editingTransaction: null }),
    openCategoryModal: (cat) =>
      set({ categoryModalOpen: true, editingCategory: cat ?? null }),
    closeCategoryModal: () =>
      set({ categoryModalOpen: false, editingCategory: null }),
    openTagModal: (tag) => set({ tagModalOpen: true, editingTag: tag ?? null }),
    closeTagModal: () => set({ tagModalOpen: false, editingTag: null }),
    openExportDialog: (startDate, endDate) =>
      set({ exportDialogOpen: true, exportInitialStartDate: startDate ?? '', exportInitialEndDate: endDate ?? '' }),
    closeExportDialog: () =>
      set({ exportDialogOpen: false, exportInitialStartDate: '', exportInitialEndDate: '' }),
    openConfirmDialog: (message, action) =>
      set({ confirmDialogOpen: true, confirmMessage: message, confirmAction: action }),
    closeConfirmDialog: () =>
      set({ confirmDialogOpen: false, confirmMessage: '', confirmAction: null }),
    addToast: (toast) =>
      set((s) => ({ toasts: [...s.toasts, { ...toast, id: Math.random().toString(36).slice(2) }] })),
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  })),
);
