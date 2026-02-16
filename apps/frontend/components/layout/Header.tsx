'use client';

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Moon, Sun } from 'lucide-react';

export function Header() {
  const { theme, language, setTheme, setLanguage } = useSessionStore();
  const t = useTranslation(language);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
      document.documentElement.setAttribute('data-lang', language);
    }
  }, [language]);
  
  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary-600">Cash Log</h1>
            <nav className="hidden md:flex space-x-4">
              <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded">
              <Moon className="w-5 h-5" />
            </button>
            <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Cash Log" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-primary-600">Cash Log</h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('dashboard')}
            </a>
            <a href="/transactions" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('transactions')}
            </a>
            <a href="/budgets" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('budgets')}
            </a>
            <a href="/analytics" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('analytics')}
            </a>
            <a href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              {t('settings')}
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
            className="pl-3 pr-8 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '12px',
            }}
            aria-label="Select language"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </header>
  );
}
