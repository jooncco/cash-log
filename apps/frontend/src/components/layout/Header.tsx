import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Settings, Moon, Sun } from 'lucide-react';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';

export function Header() {
  const { theme, setTheme, language, setLanguage } = useSessionStore();
  const t = useTranslation(language);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-smooth ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    }`;

  return (
    <header className="flex items-center justify-between border-b border-gray-200/80 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex items-center gap-8">
        <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <img src="/favicon-32x32.png" alt="Cash Log" className="h-6 w-6" />
          <span>Cash Log</span>
        </h1>
        <nav className="flex gap-1" data-testid="main-nav">
          <NavLink to="/" end className={linkClass} data-testid="nav-dashboard">
            <LayoutDashboard size={18} /> {t('dashboard')}
          </NavLink>
          <NavLink to="/transactions" className={linkClass} data-testid="nav-transactions">
            <ArrowLeftRight size={18} /> {t('transactions')}
          </NavLink>
          <NavLink to="/settings" className={linkClass} data-testid="nav-settings">
            <Settings size={18} /> {t('settings')}
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-all duration-150 ease-smooth hover:border-gray-300 hover:bg-gray-50 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-750 dark:focus:border-brand-600 dark:focus:ring-brand-900/30"
          data-testid="language-select"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded-lg p-2 text-gray-500 transition-all duration-150 ease-smooth hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          data-testid="theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
