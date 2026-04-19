import { apiClient } from './client';

export const exportApi = {
  csv: (startDate: string, endDate: string, lang?: string) =>
    apiClient.download(`/api/export/csv?startDate=${startDate}&endDate=${endDate}${lang ? `&lang=${lang}` : ''}`),
  excel: (startDate: string, endDate: string, lang?: string) =>
    apiClient.download(`/api/export/excel?startDate=${startDate}&endDate=${endDate}${lang ? `&lang=${lang}` : ''}`),
  pdf: (startDate: string, endDate: string, lang?: string) =>
    apiClient.download(`/api/export/pdf?startDate=${startDate}&endDate=${endDate}${lang ? `&lang=${lang}` : ''}`),
};
