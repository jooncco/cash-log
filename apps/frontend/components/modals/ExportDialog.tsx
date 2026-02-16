'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { Spinner } from '@/components/ui/Spinner';

type ExportFormat = 'csv' | 'excel' | 'pdf';

export function ExportDialog() {
  const { exportDialogOpen, closeExportDialog } = useUIStore();
  const { language } = useSessionStore();
  const t = useTranslation(language);
  
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Please select date range');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const endpoint = `/api/export/${format}?startDate=${startDate}&endDate=${endDate}`;
      const blob = await apiClient.download(endpoint);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${startDate}-${endDate}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      closeExportDialog();
    } catch (err) {
      setError('Export failed. Please try again.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!exportDialogOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeExportDialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="export-modal-title" className="text-2xl font-bold mb-6">
            {t('exportData')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('selectFormat')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="mr-2"
                    data-testid="export-format-csv"
                  />
                  <span>CSV</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={format === 'excel'}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="mr-2"
                    data-testid="export-format-excel"
                  />
                  <span>Excel</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={format === 'pdf'}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="mr-2"
                    data-testid="export-format-pdf"
                  />
                  <span>PDF</span>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                {t('startDate')}
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="export-start-date"
                aria-required="true"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                {t('endDate')}
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="export-end-date"
                aria-required="true"
              />
            </div>
            
            {error && (
              <p className="text-red-600 text-sm" role="alert">{error}</p>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeExportDialog}
                className="flex-1"
                disabled={loading}
                data-testid="export-cancel-button"
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleExport}
                className="flex-1"
                disabled={loading}
                data-testid="export-download-button"
              >
                {loading ? <Spinner size="sm" /> : t('export')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
