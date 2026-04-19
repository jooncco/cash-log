import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../i18n';

interface SessionState {
  theme: 'light' | 'dark';
  language: Language;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: Language) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ko',

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      setLanguage: (language) => set({ language }),
    }),
    { name: 'session-storage' },
  ),
);
