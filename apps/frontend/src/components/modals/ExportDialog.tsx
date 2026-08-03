import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../lib/stores/uiStore';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useTranslation } from '../../lib/i18n';
import { exportApi } from '../../lib/api/export';
import { downloadBlob } from '../../lib/download';

type Format = 'csv' | 'excel' | 'pdf';

const dateInputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all duration-150 ease-smooth focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400';

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
      <div className="flex flex-col gap-5" data-testid="export-dialog">
        {/* Format selection — styled radio cards */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('selectFormat')}</label>
          <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
            {(['csv', 'excel', 'pdf'] as Format[]).map((f) => (
              <label
                key={f}
                className={`relative flex cursor-pointer items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  format === f
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  className="sr-only"
                  checked={format === f}
                  onChange={() => setFormat(f)}
                />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('startDate')}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className={dateInputClassName}
              required data-testid="export-start-date" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('endDate')}</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className={dateInputClassName}
              required data-testid="export-end-date" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button variant="secondary" onClick={closeExportDialog}>{t('cancel')}</Button>
          <Button onClick={handleExport} loading={loading} disabled={!startDate || !endDate} data-testid="export-submit">
            {t('export')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
