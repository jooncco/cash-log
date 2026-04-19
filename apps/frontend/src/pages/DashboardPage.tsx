import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTransactionStore } from '../lib/stores/transactionStore';
import { useSessionStore } from '../lib/stores/sessionStore';
import { useTranslation } from '../lib/i18n';
import { MonthlySummaryCard } from '../components/MonthlySummaryCard';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { TagPieChart } from '../components/TagPieChart';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { TransactionCalendar } from '../components/TransactionCalendar';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import type { Transaction } from '../types';

import type { TranslationKey } from '../lib/i18n';
import { Badge } from '../components/ui/Badge';

function TopTable({ items, type, noDataLabel, t }: { items: Transaction[]; type: 'income' | 'expense'; noDataLabel: string; t: (k: TranslationKey) => string }) {
  if (items.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">{noDataLabel}</p>;
  const sign = type === 'income' ? '+' : '-';
  const color = type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <th className="py-1.5 text-left font-medium">{t('date')}</th>
          <th className="py-1.5 text-left font-medium">{t('category')}</th>
          <th className="py-1.5 text-left font-medium">{t('tags')}</th>
          <th className="py-1.5 text-left font-medium">{t('memo')}</th>
          <th className="py-1.5 text-right font-medium">{t('amount')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((tx) => (
          <tr key={tx.id} className="border-b border-gray-50 dark:border-gray-700/50">
            <td className="py-1.5 text-gray-600 dark:text-gray-400">{tx.transactionDate.slice(5)}</td>
            <td className="py-1.5 text-gray-700 dark:text-gray-300">{tx.category?.name ?? '-'}</td>
            <td className="py-1.5 text-gray-500 dark:text-gray-400">
              <div className="flex flex-wrap gap-0.5">
                {tx.tags.length > 0 ? tx.tags.map((tag) => <Badge key={tag.id} label={tag.name} color={tag.color} />) : '-'}
              </div>
            </td>
            <td className="py-1.5 text-gray-500 dark:text-gray-400">{tx.memo || '-'}</td>
            <td className={`py-1.5 text-right font-medium ${color}`}>{sign}{tx.amountKrw.toLocaleString()}원</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DashboardPage() {
  const { transactions, loading, setFilters } = useTransactionStore();
  const language = useSessionStore((s) => s.language);
  const theme = useSessionStore((s) => s.theme);
  const t = useTranslation(language);
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    setFilters({ startDate: undefined, endDate: undefined, type: undefined, categoryIds: undefined, tagIds: undefined });
  }, [setFilters]);

  const monthTx = useMemo(
    () => transactions.filter((tx) => tx.transactionDate.startsWith(selectedMonth)),
    [transactions, selectedMonth],
  );

  const income = monthTx.filter((tx) => tx.transactionType === 'INCOME').reduce((s, tx) => s + tx.amountKrw, 0);
  const expense = monthTx.filter((tx) => tx.transactionType === 'EXPENSE').reduce((s, tx) => s + tx.amountKrw, 0);

  const topIncome = monthTx.filter((tx) => tx.transactionType === 'INCOME').sort((a, b) => b.amountKrw - a.amountKrw).slice(0, 5);
  const topExpense = monthTx.filter((tx) => tx.transactionType === 'EXPENSE').sort((a, b) => b.amountKrw - a.amountKrw).slice(0, 5);

  if (loading && transactions.length === 0) {
    return <div className="flex h-full items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="dashboard-page">
      {/* 제목 */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h2>

      {/* 1. 월별 추이 - 전체 폭 */}
      <MonthlyTrendChart transactions={transactions} title={t('monthlyTrend')} incomeLabel={t('income')} expenseLabel={t('expense')} theme={theme} onMonthClick={setSelectedMonth} />

      {/* 2. 월 선택 */}
      <div className="flex items-center gap-3">
        <button onClick={() => { const [y, m] = selectedMonth.split('-').map(Number); const d = new Date(y, m - 2, 1); setSelectedMonth(format(d, 'yyyy-MM')); }}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {format(new Date(selectedMonth + '-01'), language === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy')}
        </h3>
        <button onClick={() => { const [y, m] = selectedMonth.split('-').map(Number); const d = new Date(y, m, 1); setSelectedMonth(format(d, 'yyyy-MM')); }}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* 3. 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MonthlySummaryCard title={t('totalIncome')} amount={income} type="income" />
        <MonthlySummaryCard title={t('totalExpense')} amount={expense} type="expense" />
        <MonthlySummaryCard title={t('balance')} amount={income - expense} type="balance" />
      </div>

      {/* 4. 달력 */}
      <TransactionCalendar transactions={monthTx} yearMonth={selectedMonth} t={t} />

      {/* 5. Top 수입/지출 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{t('topIncome')}</h3>
          <TopTable items={topIncome} type="income" noDataLabel={t('noIncomeThisMonth')} t={t} />
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('topExpense')}</h3>
            <button onClick={() => navigate('/transactions')} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              {t('viewAll')}
            </button>
          </div>
          <TopTable items={topExpense} type="expense" noDataLabel={t('noExpensesThisMonth')} t={t} />
        </Card>
      </div>

      {/* 6. 카테고리 / 태그 분석 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryPieChart transactions={monthTx} title={t('categoryBreakdown')} noDataLabel={t('noExpensesThisMonth')} theme={theme} />
        <TagPieChart transactions={monthTx} title={t('expenseByTag')} noDataLabel={t('noExpensesThisMonth')} theme={theme} />
      </div>
    </div>
  );
}
