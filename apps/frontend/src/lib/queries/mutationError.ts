import { useUIStore } from '../stores/uiStore';

/**
 * Shared onError handler for TanStack Query mutations: surfaces the
 * failure to the user via the toast system (uiStore) instead of letting
 * it disappear as a silent console rejection.
 */
export function reportMutationError(error: unknown): void {
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  useUIStore.getState().addToast({ type: 'error', message });
}
