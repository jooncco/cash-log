'use client';

import { useEffect, useMemo } from 'react';
import { useBudgetStore } from '@/lib/stores/budgetStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/uiStore';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash, AlertTriangle } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, loading, fetchBudgets, deleteBudget } = useBudgetStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  const { openBudgetModal, openConfirmDialog } = useUIStore();
  
  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
  }, []);
  
  const handleDelete = (id: number) => {
    openConfirmDialog(
      t('deleteBudgetConfirm'),
      () => deleteBudget(id)
    );
  };
  
  // Calculate budget progress
  const budgetsWithProgress = useMemo(() => {
    return (budgets || [])
      .map(budget => {
        const period = `${budget.year}-${String(budget.month).padStart(2, '0')}`;
        const categoryIds = (budget.categories || []).map(c => c.id);
        const budgetTransactions = (transactions || []).filter(t => {
          const matchesPeriod = t.transactionDate.startsWith(period);
          const isExpense = t.transactionType === 'EXPENSE';
          const matchesCategory = categoryIds.length === 0 || (t.category && categoryIds.includes(t.category.id));
          return matchesPeriod && isExpense && matchesCategory;
        });
        
        const spent = budgetTransactions.reduce((sum, t) => sum + t.amountKrw, 0);
        const remaining = budget.targetAmount - spent;
        const percentage = (spent / budget.targetAmount) * 100;
        
        let status: 'safe' | 'warning' | 'danger' = 'safe';
        if (percentage >= 100) {
          status = 'danger';
        } else if (percentage >= 80) {
          status = 'warning';
        }
        
        return {
          ...budget,
          period,
          spent,
          remaining,
          percentage: Math.min(percentage, 100),
          status,
        };
      })
      .sort((a, b) => b.period.localeCompare(a.period)); // Sort by period descending
  }, [budgets, transactions]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('budgets')}</h1>
        <Button onClick={() => openBudgetModal()}>
          <div className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            <span>{t('addBudget')}</span>
          </div>
        </Button>
      </div>
      
      {budgetsWithProgress.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">{t('noBudgets')}</p>
          <Button onClick={() => openBudgetModal()}>
            {t('setFirstBudget')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetsWithProgress.map((budget) => (
            <div
              key={budget.id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow ${
                budget.status === 'danger' ? 'ring-2 ring-red-500' :
                budget.status === 'warning' ? 'ring-2 ring-yellow-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {(budget.categories || []).map(category => (
                      <span key={category.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{budget.period}</p>
                </div>
                <div className="flex space-x-2">
                  {budget.status !== 'safe' && (
                    <AlertTriangle 
                      className={`w-5 h-5 ${
                        budget.status === 'danger' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                      aria-label={budget.status === 'danger' ? t('overBudget') : t('approachingLimit')}
                    />
                  )}
                  <button
                    onClick={() => openBudgetModal(budget)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={t('edit')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={t('delete')}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('budget')}</span>
                  <span className="font-medium">₩{budget.targetAmount.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budget.status === 'danger' ? 'bg-red-600' :
                      budget.status === 'warning' ? 'bg-yellow-500' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                    role="progressbar"
                    aria-valuenow={budget.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t('budgetProgress')}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">{t('spent')}: </span>
                    <span className={`font-medium ${
                      budget.status === 'danger' ? 'text-red-600' :
                      budget.status === 'warning' ? 'text-yellow-600' :
                      'text-gray-900 dark:text-gray-100'
                    }`}>
                      ₩{budget.spent.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('remaining')}: </span>
                    <span className={`font-medium ${
                      budget.remaining < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₩{Math.abs(budget.remaining).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {t('alertAt')} {budget.alertThreshold}% • {budget.percentage.toFixed(1)}% {t('spent')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
