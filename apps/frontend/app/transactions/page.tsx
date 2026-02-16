'use client';

import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/uiStore';
import { useTagStore } from '@/lib/stores/tagStore';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash, Download, Filter as FilterIcon, Tag } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactionStore();
  const { tags, fetchTags } = useTagStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  const { openTransactionModal, openConfirmDialog, openExportDialog, openTagModal } = useUIStore();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
    fetchTags();
  }, []);
  
  const handleDelete = (id: number) => {
    openConfirmDialog(
      t('deleteTransactionConfirm'),
      () => deleteTransaction(id)
    );
  };
  
  // Apply filters
  let filteredTransactions = transactions || [];
  
  if (startDate) {
    filteredTransactions = filteredTransactions.filter(t => t.transactionDate >= startDate);
  }
  if (endDate) {
    filteredTransactions = filteredTransactions.filter(t => t.transactionDate <= endDate);
  }
  if (selectedTags.length > 0) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.tags.some(tag => selectedTags.includes(tag.id))
    );
  }
  
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);
  };
  
  const activeFilterCount = [startDate, endDate, selectedTags.length > 0].filter(Boolean).length;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('transactions')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="secondary" className="flex items-center">
            <FilterIcon className="w-4 h-4 mr-2" />
            <span>{t('filters')}</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button onClick={() => openTagModal()} variant="secondary" className="flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            <span>{t('manageTags')}</span>
          </Button>
          <Button onClick={() => openExportDialog()} variant="secondary" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            <span>{t('export')}</span>
          </Button>
          <Button onClick={() => openTransactionModal()} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            <span>{t('addTransaction')}</span>
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('startDate')}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="filter-start-date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('endDate')}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="filter-end-date"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('tags')}</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag.id) 
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'ring-2 ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : tag.color + '40',
                    color: selectedTags.includes(tag.id) ? '#fff' : tag.color,
                    ringColor: tag.color,
                  }}
                  data-testid={`tag-filter-${tag.id}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Button onClick={clearFilters} variant="secondary" size="sm">
              {t('clearFilters')}
            </Button>
          )}
        </div>
      )}
      
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">{t('noTransactions')}</p>
          <Button onClick={() => openTransactionModal()}>
            {t('addTransaction')}
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('tags')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('type')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.transactionDate}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-1 flex-wrap">
                        {transaction.tags.map(tag => (
                          <span key={tag.id} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.transactionType === 'INCOME' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {t(transaction.transactionType === 'INCOME' ? 'income' : 'expense')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={transaction.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.transactionType === 'INCOME' ? '+' : '-'}₩{transaction.amountKrw.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                      <button
                        onClick={() => openTransactionModal(transaction)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={t('edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={t('delete')}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
