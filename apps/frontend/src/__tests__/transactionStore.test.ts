import { useTransactionStore } from '../lib/stores/transactionStore';
import { transactionApi } from '../lib/api/transactions';
import type { Transaction } from '../types';

jest.mock('../lib/api/transactions');
const mockedApi = jest.mocked(transactionApi);

const mockTx: Transaction = {
  id: 1, transactionDate: '2024-01-15', transactionType: 'EXPENSE',
  originalAmount: 10000, originalCurrency: 'KRW', amountKrw: 10000,
  category: { id: 1, name: 'Food', color: '#ff0000', createdAt: '', updatedAt: '' },
  memo: 'lunch', tags: [], createdAt: '', updatedAt: '',
};

beforeEach(() => {
  useTransactionStore.setState({ transactions: [], filters: {}, loading: false, error: null });
  jest.clearAllMocks();
});

describe('transactionStore', () => {
  it('fetchTransactions populates state', async () => {
    mockedApi.getAll.mockResolvedValue([mockTx]);
    await useTransactionStore.getState().fetchTransactions();
    expect(useTransactionStore.getState().transactions).toEqual([mockTx]);
    expect(useTransactionStore.getState().loading).toBe(false);
  });

  it('fetchTransactions sets error on failure', async () => {
    mockedApi.getAll.mockRejectedValue(new Error('Network error'));
    await useTransactionStore.getState().fetchTransactions();
    expect(useTransactionStore.getState().error).toBe('Network error');
  });

  it('addTransaction calls API and re-fetches', async () => {
    mockedApi.create.mockResolvedValue(mockTx);
    mockedApi.getAll.mockResolvedValue([mockTx]);
    await useTransactionStore.getState().addTransaction({
      transactionDate: '2024-01-15', originalAmount: 10000, transactionType: 'EXPENSE',
      originalCurrency: 'KRW', categoryId: 1, tagNames: [],
    });
    expect(mockedApi.create).toHaveBeenCalled();
    expect(mockedApi.getAll).toHaveBeenCalled();
  });

  it('deleteTransaction optimistically removes and calls API', async () => {
    useTransactionStore.setState({ transactions: [mockTx] });
    mockedApi.delete.mockResolvedValue(undefined);
    await useTransactionStore.getState().deleteTransaction(1);
    expect(useTransactionStore.getState().transactions).toEqual([]);
  });

  it('deleteTransaction rolls back on API failure', async () => {
    useTransactionStore.setState({ transactions: [mockTx] });
    mockedApi.delete.mockRejectedValue(new Error('fail'));
    await useTransactionStore.getState().deleteTransaction(1);
    expect(useTransactionStore.getState().transactions).toEqual([mockTx]);
  });
});
