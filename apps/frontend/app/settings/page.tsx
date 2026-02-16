'use client';

import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { theme, language, setTheme, setLanguage } = useSessionStore();
  const t = useTranslation(language);
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('settings')}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">{t('appearance')}</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('appearance')}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                data-testid="theme-light-button"
                aria-pressed={theme === 'light'}
              >
                <Sun className="w-5 h-5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                data-testid="theme-dark-button"
                aria-pressed={theme === 'dark'}
              >
                <Moon className="w-5 h-5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium mb-3">
              {t('language')}
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '12px',
              }}
              data-testid="language-select"
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">{t('preferences')}</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-500 text-sm">
            Additional preferences will be available in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
