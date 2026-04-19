import { useUIStore } from '../lib/stores/uiStore';

beforeEach(() => {
  useUIStore.setState({
    transactionModalOpen: false, editingTransaction: null,
    categoryModalOpen: false, editingCategory: null,
    tagModalOpen: false, editingTag: null,
    exportDialogOpen: false,
    confirmDialogOpen: false, confirmMessage: '', confirmAction: null,
    toasts: [],
  });
});

describe('uiStore', () => {
  it('opens and closes transaction modal', () => {
    useUIStore.getState().openTransactionModal();
    expect(useUIStore.getState().transactionModalOpen).toBe(true);
    useUIStore.getState().closeTransactionModal();
    expect(useUIStore.getState().transactionModalOpen).toBe(false);
  });

  it('opens confirm dialog with message and action', () => {
    const action = jest.fn();
    useUIStore.getState().openConfirmDialog('Delete?', action);
    expect(useUIStore.getState().confirmDialogOpen).toBe(true);
    expect(useUIStore.getState().confirmMessage).toBe('Delete?');
    expect(useUIStore.getState().confirmAction).toBe(action);
  });

  it('addToast adds and removeToast removes', () => {
    useUIStore.getState().addToast({ type: 'success', message: 'Done' });
    expect(useUIStore.getState().toasts).toHaveLength(1);
    const id = useUIStore.getState().toasts[0].id;
    useUIStore.getState().removeToast(id);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });
});
