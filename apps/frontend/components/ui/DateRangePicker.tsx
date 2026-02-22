'use client';

import { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const [tempEnd, setTempEnd] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setTempStart(startDate ? new Date(startDate) : null);
    setTempEnd(endDate ? new Date(endDate) : null);
  }, [startDate, endDate]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  const firstDayOfWeek = days[0].getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);
  
  const handleDayClick = (day: Date) => {
    if (selectingStart) {
      setTempStart(day);
      setTempEnd(null);
      setSelectingStart(false);
    } else {
      if (tempStart && day < tempStart) {
        setTempEnd(tempStart);
        setTempStart(day);
      } else {
        setTempEnd(day);
      }
      onRangeChange(
        format(tempStart && day < tempStart ? day : tempStart!, 'yyyy-MM-dd'),
        format(tempStart && day < tempStart ? tempStart : day, 'yyyy-MM-dd')
      );
      setIsOpen(false);
      setSelectingStart(true);
    }
  };
  
  const isInRange = (day: Date) => {
    if (!tempStart || !tempEnd) return false;
    return isWithinInterval(day, { start: tempStart, end: tempEnd });
  };
  
  const isRangeEnd = (day: Date) => {
    return (tempStart && isSameDay(day, tempStart)) || (tempEnd && isSameDay(day, tempEnd));
  };
  
  const displayText = tempStart && tempEnd 
    ? `${format(tempStart, 'yyyy-MM-dd')} ~ ${format(tempEnd, 'yyyy-MM-dd')}`
    : tempStart
    ? format(tempStart, 'yyyy-MM-dd')
    : 'Select date range';
  
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-left flex items-center justify-between"
      >
        <span className="text-sm">{displayText}</span>
        <Calendar className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const inRange = isInRange(day);
              const isEnd = isRangeEnd(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={!isCurrentMonth}
                  className={`
                    p-2 text-sm rounded transition-colors
                    ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                    ${inRange ? 'bg-blue-100 dark:bg-blue-900' : ''}
                    ${isEnd ? 'bg-blue-600 text-white font-bold' : ''}
                    ${!inRange && !isEnd && isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-500">
            <span>{selectingStart ? 'Select start date' : 'Select end date'}</span>
            <button
              onClick={() => {
                setTempStart(null);
                setTempEnd(null);
                setSelectingStart(true);
                onRangeChange('', '');
              }}
              className="text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
