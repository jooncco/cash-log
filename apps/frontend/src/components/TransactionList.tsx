import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
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
    return <p className="py-8 text-center text-gray-500">{t('noTransactions')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm [&_th]:border-r [&_th]:border-gray-100 [&_th:last-child]:border-r-0 [&_td]:border-r [&_td]:border-gray-100 [&_td:last-child]:border-r-0 dark:[&_th]:border-gray-700/50 dark:[&_td]:border-gray-700/50" data-testid="transaction-table">
        <thead className="border-b text-xs uppercase text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3">{t('date')}</th>
            <th className="px-4 py-3">{t('category')}</th>
            <th className="px-4 py-3">{t('tags')}</th>
            <th className="px-4 py-3">{t('memo')}</th>
            <th className="px-4 py-3 text-right">{t('amount')}</th>
            <th className="px-4 py-3">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="[&_td]:align-middle">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-gray-100 dark:border-gray-700"
              data-testid={`transaction-row-${tx.id}`}
            >
              <td className="px-4 py-3 text-gray-900 dark:text-white">
                {format(new Date(tx.transactionDate), 'yyyy-MM-dd')}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {tx.category?.name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                {tx.tags.map((tag) => (
                  <Badge key={tag.id} label={tag.name} color={tag.color} />
                ))}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {tx.memo || '-'}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${
                tx.transactionType === 'INCOME'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {tx.transactionType === 'INCOME' ? '+' : '-'}
                {tx.amountKrw.toLocaleString()}원
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                <button
                  onClick={() => onEdit(tx)}
                  className="rounded p-1 text-gray-400 hover:text-blue-600"
                  data-testid={`edit-tx-${tx.id}`}
                  aria-label="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  className="rounded p-1 text-gray-400 hover:text-red-600"
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
