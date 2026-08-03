import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../lib/stores/uiStore';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';

export function ConfirmDialog() {
  const { confirmDialogOpen, confirmMessage, confirmAction, closeConfirmDialog } = useUIStore();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const handleConfirm = () => {
    confirmAction?.();
    closeConfirmDialog();
  };

  return (
    <Modal open={confirmDialogOpen} onClose={closeConfirmDialog} title={t('confirmAction')} size="sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
        </div>
        <p className="whitespace-pre-line pt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {confirmMessage}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={closeConfirmDialog} data-testid="confirm-cancel">
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={handleConfirm} data-testid="confirm-ok">
          {t('confirm')}
        </Button>
      </div>
    </Modal>
  );
}
