import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useUIStore } from '../../lib/stores/uiStore';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';
import { exportApi } from '../../lib/api/export';
import { downloadBlob } from '../../lib/download';

type Format = 'csv' | 'excel' | 'pdf';

export function ExportDialog() {
  const { exportDialogOpen, exportInitialStartDate, exportInitialEndDate, closeExportDialog } = useUIStore();
  const language = useSessionStore((s) => s.language);
  const t = useTranslation(language);

  const [format, setFormat] = useState<Format>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exportDialogOpen) {
      setStartDate(exportInitialStartDate);
      setEndDate(exportInitialEndDate);
    }
  }, [exportDialogOpen, exportInitialStartDate, exportInitialEndDate]);

  const handleExport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const blob = await exportApi[format](startDate, endDate, language);
      const ext = format === 'excel' ? 'xlsx' : format;
      downloadBlob(blob, `transactions-${startDate}-${endDate}.${ext}`);
      closeExportDialog();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={exportDialogOpen} onClose={closeExportDialog} title={t('exportData')}>
      <div className="flex flex-col gap-4" data-testid="export-dialog">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('selectFormat')}</label>
          <div className="flex gap-3">
            {(['csv', 'excel', 'pdf'] as Format[]).map((f) => (
              <label key={f} className="flex items-center gap-1.5 text-sm dark:text-gray-300">
                <input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('startDate')}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required data-testid="export-start-date" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('endDate')}</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required data-testid="export-end-date" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={closeExportDialog}>{t('cancel')}</Button>
          <Button onClick={handleExport} disabled={loading || !startDate || !endDate} data-testid="export-submit">
            {loading ? <Spinner /> : t('export')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
