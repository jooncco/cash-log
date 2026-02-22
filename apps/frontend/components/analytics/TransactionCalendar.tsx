'use client';

import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, getDay } from 'date-fns';

interface TransactionCalendarProps {
  transactions: Transaction[];
  selectedMonth: string;
}

export function TransactionCalendar({ transactions, selectedMonth }: TransactionCalendarProps) {
  const calendarData = useMemo(() => {
    const date = new Date(selectedMonth + '-01');
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    
    const dailyData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = transactions.filter(t => t.transactionDate === dayStr);
      
      const income = dayTransactions
        .filter(t => t.transactionType === 'INCOME')
        .reduce((sum, t) => sum + t.amountKrw, 0);
      
      const expense = dayTransactions
        .filter(t => t.transactionType === 'EXPENSE')
        .reduce((sum, t) => sum + t.amountKrw, 0);
      
      const net = income - expense;
      
      return { day, income, expense, net };
    });
    
    const maxAbsNet = Math.max(...dailyData.map(d => Math.abs(d.net)), 1);
    
    return dailyData.map(d => ({
      ...d,
      bgColor: d.net > 0 
        ? `rgba(34, 197, 94, ${Math.abs(d.net) / maxAbsNet * 0.3})`
        : d.net < 0
        ? `rgba(239, 68, 68, ${Math.abs(d.net) / maxAbsNet * 0.3})`
        : 'transparent'
    }));
  }, [transactions, selectedMonth]);
  
  const firstDayOfWeek = getDay(new Date(selectedMonth + '-01'));
  const emptyDays = Array(firstDayOfWeek).fill(null);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
        
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {calendarData.map(({ day, income, expense, bgColor }) => (
          <div
            key={day.toISOString()}
            className="aspect-square p-2 border border-gray-200 dark:border-gray-700 rounded flex flex-col justify-between text-xs"
            style={{ backgroundColor: bgColor }}
          >
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {format(day, 'd')}
            </div>
            <div className="space-y-0.5">
              {income > 0 && (
                <div className="text-green-600 font-medium">
                  +₩{income.toLocaleString()}
                </div>
              )}
              {expense > 0 && (
                <div className="text-red-600 font-medium">
                  -₩{expense.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
