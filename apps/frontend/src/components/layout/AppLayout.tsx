import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { TransactionFormModal } from '../modals/TransactionFormModal';
import { CategoryFormModal } from '../modals/CategoryFormModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { ExportDialog } from '../modals/ExportDialog';
import { ToastContainer } from '../ToastContainer';
import { useSessionStore } from '../../lib/stores/sessionStore';

export function AppLayout() {
  const theme = useSessionStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-screen flex-col bg-gray-50/80 dark:bg-gray-950">
      <Header />
      <main className="flex-1 overflow-auto px-6 py-8">
        <Outlet />
      </main>
      <TransactionFormModal />
      <CategoryFormModal />
      <ConfirmDialog />
      <ExportDialog />
      <ToastContainer />
    </div>
  );
}
