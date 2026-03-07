import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionStore {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ko' | 'en') => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ko',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'session-storage',
    }
  )
);
