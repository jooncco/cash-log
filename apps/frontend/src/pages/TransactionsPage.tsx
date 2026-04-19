import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { useTransactionStore } from '../lib/stores/transactionStore';
import { useCategoryStore } from '../lib/stores/categoryStore';
import { useTagStore } from '../lib/stores/tagStore';
import { useUIStore } from '../lib/stores/uiStore';
import { useSessionStore } from '../lib/stores/sessionStore';
import { useTranslation } from '../lib/i18n';
import { TransactionList } from '../components/TransactionList';
import { TransactionFilters } from '../components/TransactionFilters';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export default function TransactionsPage() {
  const { transactions, filters, loading, setFilters } = useTransactionStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchTags } = useTagStore();
  const { openTransactionModal, openConfirmDialog, openExportDialog } = useUIStore();
  const { deleteTransaction } = useTransactionStore();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    setFilters({ startDate, endDate, type: undefined, categoryId: undefined, tagId: undefined });
    fetchCategories();
    fetchTags();
  }, [searchParams, setFilters, fetchCategories, fetchTags]);

  const income = transactions.filter((tx) => tx.transactionType === 'INCOME').reduce((s, tx) => s + tx.amountKrw, 0);
  const expense = transactions.filter((tx) => tx.transactionType === 'EXPENSE').reduce((s, tx) => s + tx.amountKrw, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-4" data-testid="transactions-page">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('transactions')}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => openExportDialog(filters.startDate, filters.endDate)} data-testid="export-btn">
            <Download size={16} className="mr-1 inline" /> {t('export')}
          </Button>
          <Button onClick={() => openTransactionModal()} data-testid="add-tx-btn">
            <Plus size={16} className="mr-1 inline" /> {t('addTransaction')}
          </Button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onChange={(f) => setFilters(f)}
        onClear={() => setFilters({ startDate: undefined, endDate: undefined, type: undefined, categoryId: undefined, tagId: undefined })}
        t={t}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={(tx) => openTransactionModal(tx)}
          onDelete={(tx) =>
            openConfirmDialog(t('deleteTransactionConfirm'), () => deleteTransaction(tx.id))
          }
          t={t}
        />
      )}

      <div className="flex justify-end gap-6 pt-3 text-sm">
        <span className="text-green-600 font-medium">{t('income')}: +{income.toLocaleString()}원</span>
        <span className="text-red-600 font-medium">{t('expense')}: -{expense.toLocaleString()}원</span>
        <span className="font-bold text-gray-900 dark:text-white">{t('balance')}: {(income - expense).toLocaleString()}원</span>
      </div>
    </div>
  );
}
