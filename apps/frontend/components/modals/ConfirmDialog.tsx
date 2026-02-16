'use client';

import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/uiStore';
import { Button } from '../ui/Button';

export function ConfirmDialog() {
  const { confirmDialogOpen, confirmMessage, confirmAction, closeConfirmDialog } = useUIStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    closeConfirmDialog();
  };
  
  if (!confirmDialogOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">{t('confirmAction')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{confirmMessage}</p>
        
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeConfirmDialog}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
