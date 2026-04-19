import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { useSessionStore } from '../lib/stores/sessionStore';
import type { Transaction } from '../types';
import type { TranslationKey } from '../lib/i18n';

interface Props {
  transactions: Transaction[];
  yearMonth: string;
  t: (key: TranslationKey) => string;
}

const DAY_KEYS: TranslationKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function heatBg(net: number, max: number): string | undefined {
  if (net === 0 || max === 0) return undefined;
  const ratio = Math.min(Math.abs(net) / max, 1);
  const a = (ratio * 0.3 + 0.05).toFixed(2);
  return net > 0 ? `rgba(34,197,94,${a})` : `rgba(239,68,68,${a})`;
}

export function TransactionCalendar({ transactions, yearMonth, t }: Props) {
  const navigate = useNavigate();
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const theme = useSessionStore((s) => s.theme);

  const isDark = theme === 'dark';
  const tipBg = isDark ? '#1f2937' : '#ffffff';
  const tipBorder = isDark ? '#4b5563' : '#d1d5db';

  const [year, month] = yearMonth.split('-').map(Number);

  const dailyMap = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const d = tx.transactionDate.slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(tx);
    }
    return map;
  }, [transactions]);

  const dailyNet = useMemo(() => {
    const map = new Map<string, number>();
    for (const [d, txs] of dailyMap) {
      map.set(d, txs.reduce((s, tx) => s + (tx.transactionType === 'INCOME' ? tx.amountKrw : -tx.amountKrw), 0));
    }
    return map;
  }, [dailyMap]);

  const maxAbs = useMemo(() => {
    let m = 0;
    for (const v of dailyNet.values()) m = Math.max(m, Math.abs(v));
    return m;
  }, [dailyNet]);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleClick = (day: number) => {
    const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
    navigate(`/transactions?startDate=${date}&endDate=${date}`);
  };

  return (
    <Card className="!p-0">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {DAY_KEYS.map((k) => (
          <div key={k} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{t(k)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7" data-testid="calendar-grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-20 border-b border-r border-gray-100 dark:border-gray-700/50" />;

          const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
          const txs = dailyMap.get(dateStr) ?? [];
          const net = dailyNet.get(dateStr) ?? 0;
          const incomes = txs.filter((tx) => tx.transactionType === 'INCOME');
          const expenses = txs.filter((tx) => tx.transactionType === 'EXPENSE');
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          const bg = heatBg(net, maxAbs);

          return (
            <div
              key={day}
              className={`relative flex h-20 cursor-pointer flex-col justify-between border-b border-r border-gray-100 p-1.5 transition-all hover:brightness-90 dark:border-gray-700/50 dark:hover:brightness-125 ${isToday ? 'ring-2 ring-inset ring-blue-400' : ''}`}
              style={bg ? { backgroundColor: bg } : undefined}
              onClick={() => handleClick(day)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTipPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
                setHoverDate(dateStr);
              }}
              onMouseLeave={() => { setHoverDate(null); setTipPos(null); }}
              data-testid={`cal-day-${day}`}
            >
              <div className={`text-xs font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{day}</div>

              <div className="flex flex-col items-end gap-px">
                {[...incomes, ...expenses].slice(0, 3).map((tx) => (
                  <div key={tx.id} className={`truncate text-[9px] ${tx.transactionType === 'INCOME' ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.transactionType === 'INCOME' ? '+' : '-'}{tx.amountKrw.toLocaleString()}
                  </div>
                ))}
                {txs.length > 3 && (
                  <div className="text-[9px] text-gray-400">...</div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Tooltip rendered outside grid to avoid z-index issues */}
      {hoverDate && tipPos && (dailyMap.get(hoverDate)?.length ?? 0) > 0 && (
        <div
          className="fixed z-[9999] w-56 rounded-lg p-2 shadow-xl"
          style={{ background: tipBg, border: `1px solid ${tipBorder}`, left: tipPos.x, top: tipPos.y, transform: 'translateX(-50%)' }}
        >
          <div
            className="absolute -top-[10px] left-1/2 -translate-x-1/2"
            style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `10px solid ${tipBorder}` }}
          />
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: `9px solid ${tipBg}` }}
          />
          <div className="mb-1 text-[11px] font-semibold text-gray-800 dark:text-gray-200">{hoverDate}</div>
          <ul className="max-h-40 space-y-0.5 overflow-y-auto">
            {dailyMap.get(hoverDate)!.map((tx) => (
              <li key={tx.id} className="flex justify-between text-[10px]">
                <span className="truncate text-gray-600 dark:text-gray-400">
                  {tx.category?.name ?? ''} {tx.memo ? `· ${tx.memo}` : ''}
                </span>
                <span className={tx.transactionType === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                  {tx.transactionType === 'INCOME' ? '+' : '-'}{tx.amountKrw.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
