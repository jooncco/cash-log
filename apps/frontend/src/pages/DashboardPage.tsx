import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { useTransactions } from '../lib/queries/transactions';
import { useMonthlySummary } from '../lib/queries/analytics';
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

import type { Language, TranslationKey } from '../lib/i18n';
import { Badge } from '../components/ui/Badge';

// How many months of transaction history to pull (bounded, DB-filtered) to
// feed the trend chart, calendar and top-income/expense tables. This keeps
// those views working with real transaction records without falling back to
// fetching the entire, unbounded table.
const TREND_WINDOW_MONTHS = 12;

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

function MonthPickerPopover({
  selectedMonth,
  onSelect,
  language,
}: {
  selectedMonth: string;
  onSelect: (month: string) => void;
  language: Language;
}) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => Number(selectedMonth.split('-')[0]));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openPicker = () => {
    setPickerYear(Number(selectedMonth.split('-')[0]));
    setOpen(true);
  };

  const [selYear, selMonthNum] = selectedMonth.split('-').map(Number);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={openPicker}
        className="rounded-lg px-2 py-1 text-2xl font-bold text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        data-testid="month-picker-trigger"
      >
        {format(new Date(selectedMonth + '-01'), language === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy')}
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          data-testid="month-picker-popover"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => setPickerYear((y) => y - 1)}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Previous year"
              data-testid="month-picker-prev-year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="font-semibold text-gray-900 dark:text-white" data-testid="month-picker-year">{pickerYear}</span>
            <button
              onClick={() => setPickerYear((y) => y + 1)}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Next year"
              data-testid="month-picker-next-year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isActive = pickerYear === selYear && m === selMonthNum;
              return (
                <button
                  key={m}
                  onClick={() => {
                    onSelect(`${pickerYear}-${String(m).padStart(2, '0')}`);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-2 py-1.5 text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                  data-testid={`month-picker-month-${m}`}
                >
                  {format(new Date(pickerYear, m - 1, 1), language === 'ko' ? 'M월' : 'MMM')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const language = useSessionStore((s) => s.language);
  const theme = useSessionStore((s) => s.theme);
  const t = useTranslation(language);
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [year, monthNum] = selectedMonth.split('-').map(Number);

  const windowStart = format(startOfMonth(subMonths(new Date(selectedMonth + '-01'), TREND_WINDOW_MONTHS - 1)), 'yyyy-MM-dd');
  const windowEnd = format(endOfMonth(new Date(selectedMonth + '-01')), 'yyyy-MM-dd');

  const { data: page, isLoading } = useTransactions({ startDate: windowStart, endDate: windowEnd, size: 2000 });
  const transactions = useMemo(() => page?.content ?? [], [page]);
  const { data: summary } = useMonthlySummary(year, monthNum);

  const monthTx = useMemo(
    () => transactions.filter((tx) => tx.transactionDate.startsWith(selectedMonth)),
    [transactions, selectedMonth],
  );

  const income = summary?.totalIncome ?? 0;
  const expense = summary?.totalExpense ?? 0;
  const balance = summary?.netAmount ?? income - expense;

  const topIncome = monthTx.filter((tx) => tx.transactionType === 'INCOME').sort((a, b) => b.amountKrw - a.amountKrw).slice(0, 5);
  const topExpense = monthTx.filter((tx) => tx.transactionType === 'EXPENSE').sort((a, b) => b.amountKrw - a.amountKrw).slice(0, 5);

  if (isLoading && transactions.length === 0) {
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
        <button onClick={() => setSelectedMonth(format(subMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM'))}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <MonthPickerPopover selectedMonth={selectedMonth} onSelect={setSelectedMonth} language={language} />
        <button onClick={() => setSelectedMonth(format(addMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM'))}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* 3. 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MonthlySummaryCard title={t('totalIncome')} amount={income} type="income" />
        <MonthlySummaryCard title={t('totalExpense')} amount={expense} type="expense" />
        <MonthlySummaryCard title={t('balance')} amount={balance} type="balance" />
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
        <CategoryPieChart year={year} month={monthNum} title={t('categoryBreakdown')} noDataLabel={t('noExpensesThisMonth')} theme={theme} incomeLabel={t('income')} expenseLabel={t('expense')} />
        <TagPieChart year={year} month={monthNum} title={t('expenseByTag')} noDataLabel={t('noExpensesThisMonth')} theme={theme} incomeLabel={t('income')} expenseLabel={t('expense')} />
      </div>
    </div>
  );
}
