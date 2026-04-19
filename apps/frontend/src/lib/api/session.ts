import { apiClient } from './client';
import type { SessionPreferences, UpdateSessionRequest } from '../../types';

export const sessionApi = {
  get: () => apiClient.get<SessionPreferences>('/api/session'),
  update: (data: UpdateSessionRequest) =>
    apiClient.put<SessionPreferences>('/api/session', data),
};
