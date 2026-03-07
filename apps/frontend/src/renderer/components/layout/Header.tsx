import { useEffect, useState } from 'react';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { Moon, Sun } from 'lucide-react';

type ViewType = 'dashboard' | 'transactions' | 'settings';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { theme, language, setTheme, setLanguage } = useSessionStore();
  const [mounted, setMounted] = useState(false);
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <img src="logo.png" alt="Cash Log" className="w-6 h-6" />
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Cash Log</h1>
          </div>
          <nav className="flex space-x-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1 rounded ${currentView === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('transactions')}
              className={`px-3 py-1 rounded ${currentView === 'transactions' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Transactions
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`px-3 py-1 rounded ${currentView === 'settings' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Settings
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
            className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </header>
  );
}
