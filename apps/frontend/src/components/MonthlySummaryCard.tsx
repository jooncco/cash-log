import { useEffect, useState } from 'react';

interface Props {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
}

export function MonthlySummaryCard({ title, amount, type }: Props) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 카운트업 애니메이션 (0 → 실제값, 1초 동안)
  useEffect(() => {
    setIsVisible(true);
    const duration = 1000; // 1초
    const steps = 60; // 60 프레임
    const increment = amount / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayAmount(amount);
        clearInterval(timer);
      } else {
        setDisplayAmount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [amount]);

  // 타입별 스타일 설정
  const getStyles = () => {
    const isPositive = type === 'balance' ? amount >= 0 : type === 'income';
    
    if (type === 'income') {
      return {
        gradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        border: 'border-green-200 dark:border-green-700',
        textColor: 'text-green-600 dark:text-green-400',
        icon: '↑',
        iconBg: 'bg-green-100 dark:bg-green-800/50',
      };
    } else if (type === 'expense') {
      return {
        gradient: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        border: 'border-red-200 dark:border-red-700',
        textColor: 'text-red-600 dark:text-red-400',
        icon: '↓',
        iconBg: 'bg-red-100 dark:bg-red-800/50',
      };
    } else {
      // balance - 조건부
      if (isPositive) {
        return {
          gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-600 dark:text-blue-400',
          icon: '=',
          iconBg: 'bg-blue-100 dark:bg-blue-800/50',
        };
      } else {
        return {
          gradient: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
          border: 'border-orange-200 dark:border-orange-700',
          textColor: 'text-orange-600 dark:text-orange-400',
          icon: '=',
          iconBg: 'bg-orange-100 dark:bg-orange-800/50',
        };
      }
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        rounded-xl2 border p-6 shadow-elevate
        transition-all duration-300 ease-smooth
        hover:scale-[1.03] hover:shadow-elevate-lg
        dark:shadow-elevate-dark dark:hover:shadow-elevate-lg-dark
        ${styles.gradient}
        ${styles.border}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        <div
          className={`
            flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold
            ${styles.iconBg}
            ${styles.textColor}
          `}
        >
          {styles.icon}
        </div>
      </div>
      <p className={`mt-3 text-3xl font-bold text-right tabular-nums ${styles.textColor}`}>
        {displayAmount.toLocaleString()}원
      </p>
    </div>
  );
}
