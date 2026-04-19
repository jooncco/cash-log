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
    <Modal open={confirmDialogOpen} onClose={closeConfirmDialog} title={t('confirmAction')}>
      <p className="mb-6 text-gray-700 dark:text-gray-300">{confirmMessage}</p>
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
