'use client';

import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Spinner } from '@/components/ui/Spinner';
import { format, parse } from 'date-fns';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const { transactions, loading, fetchTransactions } = useTransactionStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
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
  
  // Filter transactions
  let filteredTransactions = (transactions || []).filter(t => 
    t.transactionDate.startsWith(selectedMonth)
  );
  
  if (selectedCategory) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.tags.some(tag => tag.name === selectedCategory)
    );
  }
  
  const totalIncome = filteredTransactions
    .filter(t => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + t.amountKrw, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountKrw, 0);
  
  // Tag breakdown
  const tagBreakdown = filteredTransactions
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((acc, t) => {
      t.tags.forEach(tag => {
        acc[tag.name] = (acc[tag.name] || 0) + t.amountKrw;
      });
      return acc;
    }, {} as Record<string, number>);
  
  const categories = Object.entries(tagBreakdown)
    .sort(([, a], [, b]) => b - a);
  
  // Get unique tags for filter
  const allCategories = Array.from(new Set((transactions || []).flatMap(t => t.tags.map(tag => tag.name))));
  
  // Monthly trend data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = format(date, 'yyyy-MM');
    const monthTransactions = (transactions || []).filter(t => t.transactionDate.startsWith(monthStr));
    
    return {
      month: format(date, 'MMM yyyy'),
      income: monthTransactions.filter(t => t.transactionType === 'INCOME').reduce((sum, t) => sum + t.amountKrw, 0),
      expense: monthTransactions.filter(t => t.transactionType === 'EXPENSE').reduce((sum, t) => sum + t.amountKrw, 0),
    };
  });
  
  const lineChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: t('income'),
        data: monthlyData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: t('expense'),
        data: monthlyData.map(d => d.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };
  
  const pieChartData = {
    labels: categories.map(([cat]) => cat),
    datasets: [
      {
        data: categories.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('analytics')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            data-testid="analytics-month-filter"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '12px',
            }}
            data-testid="analytics-category-filter"
          >
            <option value="">{t('selectCategory')}</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              data-testid="analytics-clear-filter"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('totalIncome')}
          </h3>
          <p className="text-3xl font-bold text-green-600">
            ₩{totalIncome.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('totalExpense')}
          </h3>
          <p className="text-3xl font-bold text-red-600">
            ₩{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">{t('monthlyTrend')}</h2>
        <div className="h-80">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">{t('categoryBreakdown')}</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noExpensesThisMonth')}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-80">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
            <div className="space-y-4">
              {categories.map(([category, amount]) => {
                const percentage = (amount / totalExpense) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{category}</span>
                      <span className="text-gray-600">
                        ₩{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
