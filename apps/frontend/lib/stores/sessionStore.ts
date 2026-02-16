import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { sessionAPI } from '../api/session';

interface SessionState {
  sessionKey: string | null;
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  
  setSession: (sessionKey: string) => void;
  clearSession: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ko' | 'en') => void;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        sessionKey: null,
        theme: 'light',
        language: 'ko',
        
        setSession: (sessionKey) => set({ sessionKey }),
        
        clearSession: () => set({ sessionKey: null }),
        
        setTheme: (theme) => {
          set({ theme });
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
          get().savePreferences();
        },
        
        setLanguage: (language) => {
          set({ language });
          get().savePreferences();
        },
        
        loadPreferences: async () => {
          try {
            const prefs = await sessionAPI.getPreferences();
            set({
              theme: prefs.theme === 'DARK' ? 'dark' : 'light',
            });
            if (typeof window !== 'undefined') {
              document.documentElement.classList.toggle('dark', prefs.theme === 'DARK');
            }
          } catch (error) {
            console.error('Failed to load preferences:', error);
          }
        },
        
        savePreferences: async () => {
          const { theme } = get();
          try {
            await sessionAPI.updatePreferences({
              theme: theme === 'dark' ? 'DARK' : 'LIGHT',
            });
          } catch (error) {
            console.error('Failed to save preferences:', error);
          }
        },
      }),
      {
        name: 'session-storage',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    { name: 'SessionStore' }
  )
);
