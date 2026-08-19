import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { useTransactions } from '../lib/queries/transactions';
import { useMonthlySummary, useMonthlyTrend } from '../lib/queries/analytics';
import { useSessionStore } from '../lib/stores/sessionStore';
import { useTranslation } from '../lib/i18n';
import { MonthlySummaryCard } from '../components/MonthlySummaryCard';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { TagPieChart } from '../components/TagPieChart';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { TrendRangeSelector } from '../components/TrendRangeSelector';
import { TransactionCalendar } from '../components/TransactionCalendar';
import { Card } from '../components/ui/Card';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Spinner } from '../components/ui/Spinner';
import type { DateRange, Transaction } from '../types';

import type { Language, TranslationKey } from '../lib/i18n';
import { Badge } from '../components/ui/Badge';

function TopTable({ items, type, noDataLabel, t }: { items: Transaction[]; type: 'income' | 'expense'; noDataLabel: string; t: (k: TranslationKey) => string }) {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{noDataLabel}</p>;
  const sign = type === 'income' ? '+' : '-';
  const color = type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="pb-3 pt-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('date')}</th>
          <th className="pb-3 pt-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('category')}</th>
          <th className="pb-3 pt-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('tags')}</th>
          <th className="pb-3 pt-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('memo')}</th>
          <th className="pb-3 pt-1 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('amount')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((tx) => (
          <tr key={tx.id} className="border-b border-gray-100 transition-colors duration-150 ease-smooth last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
            <td className="py-3 text-gray-600 dark:text-gray-400">{tx.transactionDate.slice(5)}</td>
            <td className="py-3 font-medium text-gray-700 dark:text-gray-300">{tx.category?.name ?? '-'}</td>
            <td className="py-3 text-gray-500 dark:text-gray-400">
              <div className="flex flex-wrap gap-1">
                {tx.tags.length > 0 ? tx.tags.map((tag) => <Badge key={tag.id} label={tag.name} color={tag.color} size="xs" />) : '-'}
              </div>
            </td>
            <td className="py-3 text-gray-500 dark:text-gray-400">{tx.memo || '-'}</td>
            <td className={`py-3 text-right font-semibold tabular-nums ${color}`}>{sign}{tx.amountKrw.toLocaleString()}원</td>
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
        className="rounded-xl px-4 py-2 text-2xl font-bold text-gray-900 transition-all duration-200 ease-smooth hover:bg-gray-100 active:scale-[0.98] dark:text-white dark:hover:bg-gray-800"
        data-testid="month-picker-trigger"
      >
        {format(new Date(selectedMonth + '-01'), language === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy')}
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 animate-scale-in rounded-xl2 border border-gray-200 bg-white p-4 shadow-elevate-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-elevate-lg-dark"
          data-testid="month-picker-popover"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setPickerYear((y) => y - 1)}
              className="rounded-lg p-1.5 text-gray-500 transition-all duration-150 ease-smooth hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Previous year"
              data-testid="month-picker-prev-year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-base font-bold text-gray-900 dark:text-white" data-testid="month-picker-year">{pickerYear}</span>
            <button
              onClick={() => setPickerYear((y) => y + 1)}
              className="rounded-lg p-1.5 text-gray-500 transition-all duration-150 ease-smooth hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Next year"
              data-testid="month-picker-next-year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isActive = pickerYear === selYear && m === selMonthNum;
              return (
                <button
                  key={m}
                  onClick={() => {
                    onSelect(`${pickerYear}-${String(m).padStart(2, '0')}`);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150 ease-smooth ${isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
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

  // An empty range means "no bounds", which the trend API resolves to the full
  // recorded history — the initial view on first load.
  const [trendRange, setTrendRange] = useState<DateRange>({});
  const { data: trendPoints = [], isLoading: isTrendLoading } = useMonthlyTrend(trendRange);

  // Until the user picks a month explicitly, follow the last month in the
  // trend range so the detail section is never stuck on an empty month.
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  const selectedMonth =
    pickedMonth ?? trendPoints[trendPoints.length - 1]?.month ?? format(new Date(), 'yyyy-MM');
  const [year, monthNum] = selectedMonth.split('-').map(Number);

  const monthStart = format(startOfMonth(new Date(selectedMonth + '-01')), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date(selectedMonth + '-01')), 'yyyy-MM-dd');

  // Only the selected month is fetched as raw rows; the trend line is
  // aggregated server-side, so no unbounded transaction fetch is needed.
  const { data: page, isLoading: isMonthLoading } = useTransactions({ startDate: monthStart, endDate: monthEnd, size: 500 });
  const monthTx = useMemo(() => page?.content ?? [], [page]);
  const { data: summary } = useMonthlySummary(year, monthNum);

  const income = summary?.totalIncome ?? 0;
  const expense = summary?.totalExpense ?? 0;
  const balance = summary?.netAmount ?? income - expense;

  const topIncome = monthTx.filter((tx) => tx.transactionType === 'INCOME').sort((a, b) => b.amountKrw - a.amountKrw).slice(0, 5);
  const topExpense = monthTx.filter((tx) => tx.transactionType === 'EXPENSE').sort((a, b) => b.amountKrw - a.amountKrw).slice(0, 5);

  if (isTrendLoading && isMonthLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={32} />
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10" data-testid="dashboard-page">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('dashboard')}</h2>

      {/* 섹션 1: 월별 추이 — 기간 관점 */}
      <section aria-labelledby="trend-heading" data-testid="trend-section">
        <SectionHeading
          id="trend-heading"
          title={t('monthlyTrend')}
          description={t('monthlyTrendDesc')}
          right={<TrendRangeSelector value={trendRange} onChange={setTrendRange} t={t} />}
        />
        <MonthlyTrendChart
          points={trendPoints}
          t={t}
          language={language}
          theme={theme}
          selectedMonth={selectedMonth}
          onMonthClick={setPickedMonth}
        />
      </section>

      {/* 섹션 2: 월별 상세 — 선택한 한 달 관점 */}
      <section aria-labelledby="detail-heading" className="space-y-6" data-testid="detail-section">
        <SectionHeading
          id="detail-heading"
          title={t('monthlyDetail')}
          description={t('monthlyDetailDesc')}
          right={
            <div className="relative z-30 flex items-center gap-1">
              <button onClick={() => setPickedMonth(format(subMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM'))}
                aria-label={t('startDate')}
                className="rounded-lg p-2 text-gray-500 transition-all duration-150 ease-smooth hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <MonthPickerPopover selectedMonth={selectedMonth} onSelect={setPickedMonth} language={language} />
              <button onClick={() => setPickedMonth(format(addMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM'))}
                aria-label={t('endDate')}
                className="rounded-lg p-2 text-gray-500 transition-all duration-150 ease-smooth hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          }
        />

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MonthlySummaryCard title={t('totalIncome')} amount={income} type="income" />
          <MonthlySummaryCard title={t('totalExpense')} amount={expense} type="expense" />
          <MonthlySummaryCard title={t('balance')} amount={balance} type="balance" />
        </div>

        {/* 달력 */}
        <TransactionCalendar transactions={monthTx} yearMonth={selectedMonth} t={t} />

        {/* Top 수입/지출 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">{t('topIncome')}</h4>
            <TopTable items={topIncome} type="income" noDataLabel={t('noIncomeThisMonth')} t={t} />
          </Card>
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">{t('topExpense')}</h4>
              <button onClick={() => navigate('/transactions')} className="text-sm font-medium text-brand-600 transition-colors duration-150 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                {t('viewAll')} →
              </button>
            </div>
            <TopTable items={topExpense} type="expense" noDataLabel={t('noExpensesThisMonth')} t={t} />
          </Card>
        </div>

        {/* 카테고리 / 태그 분석 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryPieChart year={year} month={monthNum} title={t('categoryBreakdown')} noDataLabel={t('noExpensesThisMonth')} theme={theme} incomeLabel={t('income')} expenseLabel={t('expense')} />
          <TagPieChart year={year} month={monthNum} title={t('expenseByTag')} noDataLabel={t('noExpensesThisMonth')} theme={theme} incomeLabel={t('income')} expenseLabel={t('expense')} />
        </div>
      </section>
    </div>
  );
}
