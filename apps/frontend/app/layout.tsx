import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { TransactionFormModal } from '@/components/modals/TransactionFormModal';
import { BudgetFormModal } from '@/components/modals/BudgetFormModal';
import { TagFormModal } from '@/components/modals/TagFormModal';
import { ExportDialog } from '@/components/modals/ExportDialog';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';

export const metadata: Metadata = {
  title: 'Cash Log - Personal Finance Tracker',
  description: 'Track your income and expenses',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('session-storage');
                  if (stored) {
                    const { state } = JSON.parse(stored);
                    if (state.theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                    if (state.language) {
                      document.documentElement.setAttribute('lang', state.language);
                      document.documentElement.setAttribute('data-lang', state.language);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <Header />
        <main id="main-content" className="container mx-auto px-4 py-8">
          {children}
        </main>
        <TransactionFormModal />
        <BudgetFormModal />
        <TagFormModal />
        <ExportDialog />
        <ConfirmDialog />
      </body>
    </html>
  );
}
