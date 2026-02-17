'use client';

import { useEffect } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { transactions, loading, fetchTransactions } = useTransactionStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  const totalIncome = (transactions || [])
    .filter(t => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + t.amountKrw, 0);
  
  const totalExpense = (transactions || [])
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountKrw, 0);
  
  const balance = totalIncome - totalExpense;
  
  // Sort transactions by date descending (newest first)
  const sortedTransactions = [...(transactions || [])].sort((a, b) => 
    b.transactionDate.localeCompare(a.transactionDate)
  );
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalIncome')}</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ₩{totalIncome.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalExpense')}</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">
            ₩{totalExpense.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('balance')}</h3>
          <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ₩{balance.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{t('recentTransactions')}</h2>
        {sortedTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noTransactions')}</p>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded"
              >
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    {transaction.category && (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {transaction.category.name}
                      </span>
                    )}
                    {transaction.tags.map(tag => (
                      <span key={tag.id} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{transaction.transactionDate}</p>
                </div>
                <p className={`font-bold ${transaction.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.transactionType === 'INCOME' ? '+' : '-'}₩{transaction.amountKrw.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
