import { format } from 'date-fns';
import { Edit, Trash2, Receipt } from 'lucide-react';
import { Badge } from './ui/Badge';
import type { Transaction } from '../types';
import type { TranslationKey } from '../lib/i18n';

interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  t: (key: TranslationKey) => string;
}

export function TransactionList({ transactions, onEdit, onDelete, t }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <Receipt size={40} strokeWidth={1.5} className="mb-3" />
        <p className="text-sm font-medium">{t('noTransactions')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" data-testid="transaction-table">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800/40">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('date')}</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('category')}</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('tags')}</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('memo')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('amount')}</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-gray-100 transition-colors duration-150 ease-smooth hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-800/40"
              data-testid={`transaction-row-${tx.id}`}
            >
              <td className="whitespace-nowrap px-4 py-3.5 text-gray-900 dark:text-white">
                {format(new Date(tx.transactionDate), 'yyyy-MM-dd')}
              </td>
              <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                {tx.category?.name ?? '-'}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1">
                {tx.tags.map((tag) => (
                  <Badge key={tag.id} label={tag.name} color={tag.color} />
                ))}
                </div>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3.5 text-gray-500 dark:text-gray-400">
                {tx.memo || '-'}
              </td>
              <td className={`whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular ${
                tx.transactionType === 'INCOME'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {tx.transactionType === 'INCOME' ? '+' : '-'}
                {tx.amountKrw.toLocaleString()}원
              </td>
              <td className="px-4 py-3.5">
                <div className="flex gap-0.5">
                <button
                  onClick={() => onEdit(tx)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                  data-testid={`edit-tx-${tx.id}`}
                  aria-label="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  data-testid={`delete-tx-${tx.id}`}
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
