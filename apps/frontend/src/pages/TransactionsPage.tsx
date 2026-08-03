import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { useTransactions, useDeleteTransaction } from '../lib/queries/transactions';
import { useUIStore } from '../lib/stores/uiStore';
import { useSessionStore } from '../lib/stores/sessionStore';
import { useTranslation } from '../lib/i18n';
import { TransactionList } from '../components/TransactionList';
import { TransactionFilters } from '../components/TransactionFilters';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import type { Transaction, TransactionFilterParams } from '../types';

const PAGE_SIZE = 20;

function transactionSummary(tx: Transaction): string {
  const sign = tx.transactionType === 'INCOME' ? '+' : '-';
  const category = tx.category?.name ?? '-';
  return `${tx.transactionDate} · ${category} · ${sign}${tx.amountKrw.toLocaleString()}원`;
}

export default function TransactionsPage() {
  const { transactionFilters: filters, setTransactionFilters, openTransactionModal, openConfirmDialog, openExportDialog } = useUIStore();
  const { data: page, isLoading } = useTransactions({ size: PAGE_SIZE, ...filters });
  const transactions = page?.content ?? [];
  const deleteTransaction = useDeleteTransaction();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    setTransactionFilters({ startDate, endDate, type: undefined, categoryIds: undefined, tagIds: undefined, page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setTransactionFilters]);

  // Any filter change other than the page itself should jump back to page 0,
  // otherwise the user can land on a page number that no longer exists.
  const handleFilterChange = (f: Partial<TransactionFilterParams>) => {
    setTransactionFilters({ ...f, page: 0 });
  };

  const handleClear = () => {
    setTransactionFilters({ startDate: undefined, endDate: undefined, type: undefined, categoryIds: undefined, tagIds: undefined, page: 0 });
  };

  const handleDelete = (tx: Transaction) => {
    const message = `${t('deleteTransactionConfirm')}\n\n${transactionSummary(tx)}`;
    openConfirmDialog(message, () => deleteTransaction.mutate(tx.id));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="transactions-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('transactions')}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openExportDialog(filters.startDate, filters.endDate)} data-testid="export-btn">
            <Download size={16} /> {t('export')}
          </Button>
          <Button size="sm" onClick={() => openTransactionModal()} data-testid="add-tx-btn">
            <Plus size={16} /> {t('addTransaction')}
          </Button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
        t={t}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <Card noPadding>
          <TransactionList
            transactions={transactions}
            onEdit={(tx) => openTransactionModal(tx)}
            onDelete={handleDelete}
            t={t}
          />
          <Pagination
            page={page?.page ?? 0}
            totalPages={page?.totalPages ?? 0}
            totalElements={page?.totalElements ?? 0}
            onPageChange={(p) => setTransactionFilters({ page: p })}
            totalLabel={t('totalCount')}
            pageLabel={t('page')}
          />
        </Card>
      )}
    </div>
  );
}
