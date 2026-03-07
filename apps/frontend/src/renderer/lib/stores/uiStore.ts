import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Transaction, Tag, Category, Notification } from '@/types';

interface UIState {
  transactionModalOpen: boolean;
  tagModalOpen: boolean;
  categoryModalOpen: boolean;
  exportDialogOpen: boolean;
  confirmDialogOpen: boolean;
  
  editingTransaction: Transaction | null;
  editingTag: Tag | null;
  editingCategory: Category | null;
  confirmAction: (() => void) | null;
  confirmMessage: string;
  
  notifications: Notification[];
  
  openTransactionModal: (transaction?: Transaction) => void;
  closeTransactionModal: () => void;
  openTagModal: (tag?: Tag) => void;
  closeTagModal: () => void;
  openCategoryModal: (category?: Category) => void;
  closeCategoryModal: () => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openConfirmDialog: (message: string, action: () => void) => void;
  closeConfirmDialog: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      transactionModalOpen: false,
      tagModalOpen: false,
      categoryModalOpen: false,
      exportDialogOpen: false,
      confirmDialogOpen: false,
      
      editingTransaction: null,
      editingTag: null,
      editingCategory: null,
      confirmAction: null,
      confirmMessage: '',
      
      notifications: [],
      
      openTransactionModal: (transaction) =>
        set({ transactionModalOpen: true, editingTransaction: transaction || null }),
      closeTransactionModal: () =>
        set({ transactionModalOpen: false, editingTransaction: null }),
      
      openTagModal: (tag) =>
        set({ tagModalOpen: true, editingTag: tag || null }),
      closeTagModal: () =>
        set({ tagModalOpen: false, editingTag: null }),
      
      openCategoryModal: (category) =>
        set({ categoryModalOpen: true, editingCategory: category || null }),
      closeCategoryModal: () =>
        set({ categoryModalOpen: false, editingCategory: null }),
      
      openExportDialog: () => set({ exportDialogOpen: true }),
      closeExportDialog: () => set({ exportDialogOpen: false }),
      
      openConfirmDialog: (message, action) =>
        set({ confirmDialogOpen: true, confirmMessage: message, confirmAction: action }),
      closeConfirmDialog: () =>
        set({ confirmDialogOpen: false, confirmMessage: '', confirmAction: null }),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now().toString() },
          ],
        })),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: 'UIStore' }
  )
);
