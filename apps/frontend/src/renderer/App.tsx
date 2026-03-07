import React, { Suspense, useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { useSessionStore } from './lib/stores/sessionStore';
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { CategoryFormModal } from './components/modals/CategoryFormModal';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { ExportDialog } from './components/modals/ExportDialog';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

type ViewType = 'dashboard' | 'transactions' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const theme = useSessionStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-auto p-6">
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
          {currentView === 'dashboard' && <DashboardPage />}
          {currentView === 'transactions' && <TransactionsPage />}
          {currentView === 'settings' && <SettingsPage />}
        </Suspense>
      </main>
      <TransactionFormModal />
      <CategoryFormModal />
      <ConfirmDialog />
      <ExportDialog />
    </div>
  );
}

export default App;
