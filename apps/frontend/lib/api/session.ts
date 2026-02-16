import { apiClient } from './client';
import { SessionPreferences, UpdateSessionRequest } from '@/types';

export const sessionAPI = {
  getPreferences: () => {
    return apiClient.get<SessionPreferences>('/api/session/preferences');
  },
  
  updatePreferences: (data: UpdateSessionRequest) => {
    return apiClient.put<SessionPreferences>('/api/session/preferences', data);
  },
};
